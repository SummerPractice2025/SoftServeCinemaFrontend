import React from 'react';
import '../styles/PriceBlock.css';

interface PriceBlockProps {
  priceStandard?: number;
  priceVip?: number;
  onPriceChange: (priceStandard: number, priceVip: number) => void;
  onError?: (message: string) => void;
}

const PriceBlock: React.FC<PriceBlockProps> = ({
  priceStandard,
  priceVip,
  onPriceChange,
  onError,
}) => {
  const safePriceStandard = Number.isNaN(priceStandard)
    ? 120
    : (priceStandard ?? 120);
  const safePriceVip = Number.isNaN(priceVip) ? 180 : (priceVip ?? 180);

  const handlePriceChange = (value: string, isStandard: boolean) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const numericValueParsed = numericValue ? parseInt(numericValue) : 0;

    const minPrice = 0.1;
    if (numericValueParsed < minPrice && numericValueParsed !== 0) {
      const fieldName = isStandard ? 'стандартної ціни' : 'VIP ціни';
      onError?.(
        `Мінімальна ціна для ${fieldName} повинна бути не менше ${minPrice}₴`,
      );
      return;
    }

    if (isStandard) {
      onPriceChange(numericValueParsed, safePriceVip);
    } else {
      onPriceChange(safePriceStandard, numericValueParsed);
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
              placeholder="120"
              value={safePriceStandard}
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
              placeholder="180"
              value={safePriceVip}
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
