import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  CheckCircle2,
  Zap,
  Sparkles,
  Shield,
  Clock,
  Download,
  FileText,
  RotateCcw,
  ArrowRight,
  RefreshCw,
  HardDrive,
  Cpu,
  Bot,
  Layers,
  ChevronRight,
  TrendingUp,
  X,
  Lock,
  DollarSign,
  Receipt,
  Wallet,
  Coins,
  QrCode,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { PlanConfig, PlanTier, PaymentRecord, SubscriptionState, User } from '../types';
import { pricingPlans, initialSubscription, initialPaymentHistory } from '../data/pricingData';

interface PricingBillingViewProps {
  user: User | null;
  botCount?: number;
}

interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  memo?: string;
  rateUsd: number; // exchange rate per 1 unit
  iconBg: string;
  iconText: string;
}

const SUPPORTED_CRYPTO_ASSETS: CryptoAsset[] = [
  {
    id: 'usdt-trc20',
    name: 'Tether USD',
    symbol: 'USDT',
    network: 'TRON (TRC-20)',
    address: 'TQn9Y2khEsLJW1ChVWFMSMeSTow5KAnsP5',
    rateUsd: 1.0,
    iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    iconText: '₮',
  },
  {
    id: 'ton',
    name: 'Toncoin',
    symbol: 'TON',
    network: 'The Open Network',
    address: 'EQD_v2a94KLsFmY381hPskLm21PskQm19_88x1',
    memo: '819204',
    rateUsd: 6.80,
    iconBg: 'bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-400',
    iconText: '💎',
  },
  {
    id: 'usdt-ton',
    name: 'Tether USD (TON)',
    symbol: 'USD₮',
    network: 'TON Jetton',
    address: 'EQA_TON_JETTON_USDT_GATEWAY_RECEIVE_2026',
    rateUsd: 1.0,
    iconBg: 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400',
    iconText: '₮',
  },
  {
    id: 'btc-lightning',
    name: 'Bitcoin Lightning',
    symbol: 'BTC',
    network: 'Lightning Network / Mainnet',
    address: 'lnbc25000n1pj99...telebot_pay_invoice',
    rateUsd: 94000.0,
    iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
    iconText: '₿',
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    network: 'Solana Mainnet-Beta',
    address: '7v9W1dM6Qp2G5uP8sH3vK9xY1zB4c7E9m2A5r8T1w3',
    rateUsd: 195.0,
    iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400',
    iconText: '◎',
  },
  {
    id: 'binance-pay',
    name: 'Binance Pay Crypto',
    symbol: 'USDT / BUSD',
    network: 'Binance Pay ID',
    address: '89201948',
    rateUsd: 1.0,
    iconBg: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-600 dark:text-yellow-400',
    iconText: '🟡',
  },
];

export const PricingBillingView: React.FC<PricingBillingViewProps> = ({
  user,
  botCount = 2,
}) => {
  const [subscription, setSubscription] = useState<SubscriptionState>({
    ...initialSubscription,
    usedBots: botCount,
  });

  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>(initialPaymentHistory);
  const [billingTab, setBillingTab] = useState<'overview' | 'invoices'>('overview');

  // Multi-step Crypto Checkout State
  const [checkoutPlan, setCheckoutPlan] = useState<PlanConfig | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoAsset>(SUPPORTED_CRYPTO_ASSETS[0]);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3 | 4>(1);
  const [txidInput, setTxidInput] = useState('');
  const [isVerifyingBlockchain, setIsVerifyingBlockchain] = useState(false);
  const [blockConfirmations, setBlockConfirmations] = useState(0);
  const [timeRemainingSec, setTimeRemainingSec] = useState(900); // 15 mins
  const [activeInvoice, setActiveInvoice] = useState<PaymentRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentPlan = pricingPlans.find((p) => p.id === subscription.currentPlanId) || pricingPlans[0];

  // Expiration countdown timer
  useEffect(() => {
    if (checkoutPlan && checkoutStep === 3 && timeRemainingSec > 0) {
      const timer = setInterval(() => {
        setTimeRemainingSec((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [checkoutPlan, checkoutStep, timeRemainingSec]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleAutoRenew = () => {
    const nextVal = !subscription.autoRenew;
    setSubscription((prev) => ({ ...prev, autoRenew: nextVal }));
    showToast(nextVal ? 'Auto-renewal enabled for next billing cycle' : 'Auto-renewal disabled');
  };

  const handleStartCheckout = (plan: PlanConfig) => {
    if (plan.id === subscription.currentPlanId) {
      showToast(`You are already subscribed to ${plan.name}`);
      return;
    }
    setCheckoutPlan(plan);
    setCheckoutStep(2); // Step 2: Choose Crypto Asset
    setTimeRemainingSec(900);
    setTxidInput('');
    setBlockConfirmations(0);
  };

  const calculateAmountDue = (plan: PlanConfig) => {
    const base = plan.price;
    if (billingCycle === 'Yearly') {
      return Number((base * 12 * 0.8).toFixed(2)); // 20% discount
    }
    return base;
  };

  const calculateCryptoAmount = (plan: PlanConfig, crypto: CryptoAsset) => {
    const usd = calculateAmountDue(plan);
    if (crypto.rateUsd === 1.0) return `${usd.toFixed(2)} ${crypto.symbol}`;
    const calculated = usd / crypto.rateUsd;
    return `${calculated.toFixed(crypto.symbol === 'BTC' ? 6 : 4)} ${crypto.symbol}`;
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard`);
  };

  const handleSimulateBlockchainVerification = () => {
    setIsVerifyingBlockchain(true);
    setBlockConfirmations(1);

    setTimeout(() => {
      setBlockConfirmations(2);
    }, 1200);

    setTimeout(() => {
      setBlockConfirmations(3);
      setIsVerifyingBlockchain(false);

      if (checkoutPlan) {
        const newRecord: PaymentRecord = {
          id: `pay-${Date.now()}`,
          transactionId: txidInput || `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          invoiceId: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          planId: checkoutPlan.id,
          planName: `${checkoutPlan.name} (${billingCycle})`,
          amount: calculateAmountDue(checkoutPlan),
          paymentMethod: selectedCrypto.name,
          status: 'Success',
          cryptoNetwork: selectedCrypto.network,
          depositAddress: selectedCrypto.address,
        };

        setPaymentHistory((prev) => [newRecord, ...prev]);
        setSubscription((prev) => ({
          ...prev,
          currentPlanId: checkoutPlan.id,
          status: 'Active',
          billingCycle,
          activatedDate: new Date().toISOString().split('T')[0],
          nextBillingDate: '2026-10-15',
        }));

        setCheckoutStep(4); // Success!
        showToast(`🎉 Upgraded to ${checkoutPlan.name}!`);
      }
    }, 2500);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center gap-2 text-xs font-bold border border-white/10"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-purple-600/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-blue-600 text-white tracking-wider uppercase shadow-xs flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                <span>Crypto Deposit &amp; Upgrades</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                Crypto Only (Zero Fees)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Crypto Deposit &amp; Cloud Quotas
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl font-medium">
              Deposit cryptocurrency directly (USDT, TON, BTC Lightning, Solana) to instantly upgrade cluster storage, bot execution limits, and dedicated worker nodes.
            </p>
          </div>

          {/* Current Active Resource Allocation Badge */}
          <div className="px-5 py-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/25 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allocated Tier</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {currentPlan.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {currentPlan.storageLimitGB} GB Storage
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                Crypto Verified • High Speed Cluster
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="glass-panel p-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setBillingTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Upgrade Plans &amp; Storage
          </button>
          <button
            type="button"
            onClick={() => setBillingTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingTab === 'invoices'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Crypto Invoices &amp; History ({paymentHistory.length})
          </button>
        </div>

        {/* Monthly vs Yearly Switch */}
        {billingTab === 'overview' && (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setBillingCycle('Monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                billingCycle === 'Monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('Yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                billingCycle === 'Yearly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <span>Yearly</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[9px] font-black">
                Save 20%
              </span>
            </button>
          </div>
        )}
      </div>

      {/* OVERVIEW TAB: PRICING PLANS */}
      {billingTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pricingPlans.map((plan) => {
            const isCurrent = plan.id === subscription.currentPlanId;
            const priceDue = calculateAmountDue(plan);

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`glass-panel rounded-3xl p-5 sm:p-6 border flex flex-col justify-between relative shadow-xs ${
                  plan.isPopular
                    ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider shadow-md shadow-blue-500/20">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">
                      {plan.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      ${priceDue}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      USDT / {billingCycle === 'Yearly' ? 'year' : 'month'}
                    </span>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2.5 mb-6 text-xs">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium">
                      <span>Cloud Storage</span>
                      <strong className="text-slate-900 dark:text-white">{plan.storageLimitGB} GB NVMe</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium">
                      <span>Bot Limit</span>
                      <strong className="text-slate-900 dark:text-white">{plan.botLimit} Bots</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium">
                      <span>Executions</span>
                      <strong className="text-slate-900 dark:text-white">
                        {typeof plan.executionLimit === 'number' ? plan.executionLimit.toLocaleString() : plan.executionLimit}
                      </strong>
                    </div>

                    <div className="pt-2 space-y-2">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                          <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5 stroke-[3]" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Plan Action Button */}
                <div>
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold cursor-not-allowed text-center"
                    >
                      Current Active Plan
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartCheckout(plan)}
                      className={`w-full py-2.5 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        plan.isPopular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Upgrade with Crypto</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* INVOICES TAB */}
      {billingTab === 'invoices' && (
        <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Invoice ID</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Plan / Description</th>
                  <th className="px-5 py-3.5">Crypto Gateway</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {paymentHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {item.invoiceId}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {item.date}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {item.planName}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
                        {item.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-black text-slate-900 dark:text-white">
                      ${item.amount.toFixed(2)} USDT
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveInvoice(item)}
                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MULTI-STEP CRYPTO CHECKOUT MODAL */}
      <AnimatePresence>
        {checkoutPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-panel w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-300 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden bg-white dark:bg-slate-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
                      Step {checkoutStep} of 4
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs font-bold text-slate-500">
                      Crypto Checkout
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    Upgrade to {checkoutPlan.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setCheckoutPlan(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto py-5 space-y-4 text-xs pr-1">
                {/* STEP 2: CHOOSE CRYPTO ASSET */}
                {checkoutStep === 2 && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Amount Due</span>
                        <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                          ${calculateAmountDue(checkoutPlan)} USDT
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        {billingCycle} Billing
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Select Cryptocurrency
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SUPPORTED_CRYPTO_ASSETS.map((crypto) => {
                        const isSelected = selectedCrypto.id === crypto.id;
                        return (
                          <div
                            key={crypto.id}
                            onClick={() => setSelectedCrypto(crypto)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/25'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 ${crypto.iconBg}`}>
                                {crypto.iconText}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">
                                  {crypto.name}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {crypto.network}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3: DEPOSIT INVOICE & ADDRESS */}
                {checkoutStep === 3 && (
                  <div className="space-y-4">
                    {/* Timer Alert */}
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span className="font-bold text-amber-900 dark:text-amber-200">
                          Deposit Invoice Active
                        </span>
                      </div>
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400">
                        {formatTimer(timeRemainingSec)}
                      </span>
                    </div>

                    {/* Deposit Address Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          Send Exact Crypto Amount:
                        </span>
                        <span className="font-mono font-black text-base text-blue-600 dark:text-blue-400">
                          {calculateCryptoAmount(checkoutPlan, selectedCrypto)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-1">
                          Deposit Address ({selectedCrypto.network}):
                        </span>
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate flex-1 select-all">
                            {selectedCrypto.address}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(selectedCrypto.address, 'Deposit Address')}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Copy Address"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {selectedCrypto.memo && (
                        <div>
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-1">
                            Deposit Memo / Tag (Required for TON):
                          </span>
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="font-mono text-xs font-bold text-amber-600 select-all">
                              {selectedCrypto.memo}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(selectedCrypto.memo!, 'Memo')}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* TxID Input & Confirm */}
                    <div className="space-y-2">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold">
                        Transaction Hash / TxID (Optional for automated detection):
                      </label>
                      <input
                        type="text"
                        value={txidInput}
                        onChange={(e) => setTxidInput(e.target.value)}
                        placeholder="Paste transaction hash or leave empty for mempool scan"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>

                    {/* Blockchain status simulator */}
                    {isVerifyingBlockchain && (
                      <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 space-y-2">
                        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold">
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Listening on {selectedCrypto.network}...</span>
                          </span>
                          <span>{blockConfirmations}/3 Confirmations</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-700"
                            style={{ width: `${(blockConfirmations / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: SUCCESS & ACTIVATION */}
                {checkoutStep === 4 && (
                  <div className="py-6 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        Payment Verified &amp; Activated!
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                        Your bot cluster has been upgraded to {checkoutPlan.name} on {selectedCrypto.network}.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto text-left space-y-2">
                      <div className="flex justify-between text-slate-500">
                        <span>Plan Tier</span>
                        <strong className="text-slate-900 dark:text-white">{checkoutPlan.name}</strong>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Storage Limit</span>
                        <strong className="text-slate-900 dark:text-white">{checkoutPlan.storageLimitGB} GB NVMe</strong>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Status</span>
                        <strong className="text-emerald-600">Active (Live)</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between gap-3">
                {checkoutStep === 2 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCheckoutPlan(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(3)}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Proceed to Deposit</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {checkoutStep === 3 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(2)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={isVerifyingBlockchain}
                      onClick={handleSimulateBlockchainVerification}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify &amp; Activate</span>
                    </button>
                  </>
                )}

                {checkoutStep === 4 && (
                  <button
                    type="button"
                    onClick={() => setCheckoutPlan(null)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Done &amp; Return to Dashboard
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INVOICE RECEIPT MODAL */}
      <AnimatePresence>
        {activeInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-300 dark:border-slate-800 space-y-4 bg-white dark:bg-slate-900"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Official Crypto Invoice
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice Number</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{activeInvoice.invoiceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Settlement</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeInvoice.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plan Description</span>
                    <span className="font-bold text-blue-600">{activeInvoice.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Crypto Gateway</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeInvoice.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction Hash</span>
                    <span className="font-mono text-slate-400 truncate max-w-[180px]">{activeInvoice.transactionId}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white">Total Paid</span>
                    <span className="font-black text-base text-slate-900 dark:text-white">${activeInvoice.amount.toFixed(2)} USDT</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInvoice(null)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
