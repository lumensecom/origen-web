import { useEffect, useState } from 'react';
import QRCodeLib from 'qrcode';

// Renders a QR code for any string. Uses the ORIGEN dark tone for the modules
// so it sits naturally inside the brand's cards.
const QRCode = ({ value, size = 220, className = '' }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    let active = true;
    QRCodeLib.toDataURL(String(value), {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0D1F0F', light: '#FFFFFF' },
    })
      .then(u => { if (active) setUrl(u); })
      .catch(() => { if (active) setUrl(''); });
    return () => { active = false; };
  }, [value, size]);

  if (!url) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-gray-100 animate-pulse rounded-[16px] ${className}`}
      />
    );
  }

  return (
    <img
      src={url}
      width={size}
      height={size}
      alt="Código QR del pedido"
      className={`rounded-[12px] ${className}`}
    />
  );
};

export default QRCode;
