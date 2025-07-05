import React from 'react';
import '../styles/PriceBlock.css';

interface PriceBlockProps {
  priceStandard?: number;
  priceVip?: number;
  onPriceChange: (priceStandard: number, priceVip: number) => void;
}

const PriceBlock: React.FC<PriceBlockProps> = ({
  priceStandard,
  priceVip,
  onPriceChange,
}) => {
  const handlePriceChange = (value: string, isStandard: boolean) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const numericValueParsed = numericValue ? parseInt(numericValue) : 0;
    if (isStandard) {
      onPriceChange(numericValueParsed, priceVip ?? 0);
    } else {
      onPriceChange(priceStandard ?? 0, numericValueParsed);
    }
  };

  return (
    <div className="price-wrapper">
      <div className="price-section">
        <div className="price-block">
          <label className="price-label">Стандартна ціна</label>
          <div className="price-input-wrapper">
            <input
              type="text"
              inputMode="numeric"
              className="price-input"
              placeholder="0"
              value={priceStandard ?? ''}
              onChange={(e) => handlePriceChange(e.target.value, true)}
            />
            <span className="currency-symbol">₴</span>
          </div>
        </div>

        <div className="price-block">
          <label className="price-label">Ціна VIP</label>
          <div className="price-input-wrapper">
            <input
              type="text"
              inputMode="numeric"
              className="price-input"
              placeholder="0"
              value={priceVip ?? ''}
              onChange={(e) => handlePriceChange(e.target.value, false)}
            />
            <span className="currency-symbol">₴</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceBlock;
