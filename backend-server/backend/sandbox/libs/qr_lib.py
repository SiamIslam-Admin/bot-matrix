import urllib.parse as _urlparse


class QRLib:
    """libs.QR — QR code image URL generator."""

    def url(self, data, size=300):
        encoded = _urlparse.quote(str(data))
        return f"https://api.qrserver.com/v1/create-qr-code/?size={size}x{size}&data={encoded}"
