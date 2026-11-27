import React from 'react';
import { toast } from 'react-toastify';
import produce from 'immer';
import { useAppDispatch, useAppState } from '@components/common/context/app';
import PropTypes from 'prop-types';

// Импортируй ToastMessage (как у тебя реализован выше)
function ToastMessage({ thumbnail, name, qty, count, cartUrl, toastId }) {
  return (
    <div
      style={{
        minWidth: 300,
        maxWidth: 400,
        background: '#181A20',
        borderRadius: 12,
        padding: '18px 20px 16px 20px',
        boxShadow: '0 2px 24px 0 #1113',
        color: '#f1f1f1',
        fontFamily: 'inherit',
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: 0.5 }}>Товар добавлен</div>
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            toast.dismiss(toastId);
          }}
          style={{ color: '#bbb', textDecoration: 'none' }}
          aria-label="Закрыть"
        >
          <svg width="22" height="22" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </a>
      </div>
      <div style={{display: 'flex', alignItems: 'center', margin: '18px 0 12px 0', gap: 14}}>
        {thumbnail
          ? <img src={thumbnail} alt={name} style={{
                width: 58,
                height: 58,
                borderRadius: 8,
                background: '#222',
                objectFit: 'cover',
                boxShadow: '0 1px 5px 0 #0006'
            }}/>
          : <div style={{
                width: 58,
                height: 58,
                borderRadius: 8,
                background: '#23262F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888'
            }}>Нет<br/>фото</div>
        }
        <div style={{flex: 1}}>
          <div style={{fontSize: 15, fontWeight: 600, marginBottom: 2, color: '#fff'}}>{name}</div>
          <div style={{fontSize: 13, color: '#bbb'}}>Количество: <b>{typeof qty === 'object' ? qty.qty : qty}</b></div>
        </div>
      </div>
      <a
        href={cartUrl}
        style={{
          display: 'block',
          background: '#23262F',
          borderRadius: 7,
          textAlign: 'center',
          fontWeight: 600,
          padding: '8px 0',
          color: '#43ffa3',
          fontSize: 15,
          marginBottom: 5,
          letterSpacing: 0.5
        }}
      >
        Перейти в корзину {count > 0 ? `(${count})` : ''}
      </a>
      <div style={{textAlign: 'center'}}>
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            toast.dismiss(toastId);
          }}
          style={{
            color: '#7b7b7b',
            fontSize: 13,
            textDecoration: 'underline',
            marginTop: 3,
            display: 'inline-block'
          }}
        >
          Продолжить покупки
        </a>
      </div>
    </div>
  );
}

ToastMessage.propTypes = {
  cartUrl: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  qty: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
  thumbnail: PropTypes.string,
  toastId: PropTypes.string.isRequired
};

ToastMessage.defaultProps = {
  thumbnail: null
};
export default function CartAddToCartButton({ product }) {
  const appContext = useAppState();
  const { setData } = useAppDispatch();

  const handleAddToCart = () => {
    fetch('/api/cart/mine/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ sku: product.sku, qty: "1" })
    })
      .then(res => res.json())
      .then(response => {
        if (!response.error) {
          setData(
            produce(appContext, (draff) => {
              draff.cart = appContext.cart || {};
              draff.cart.totalQty = response.data.count;
              draff.cart.uuid = response.data.cartId;
            })
          );
          toast(
            <ToastMessage
              thumbnail={product.image?.url || product.gallery?.[0]?.thumb}
              name={product.name}
              qty={response.data.item.qty}
              count={response.data.count}
              cartUrl="/cart"
              toastId={`t${Date.now()}${Math.random().toString(36).slice(2)}`}
            />,
            { closeButton: false }
          );
          window.dispatchEvent(new CustomEvent('cart:changed'));
        } else {
          toast.error(response.error.message);
        }
      })
      .catch(() => {
        toast.error('Ошибка при добавлении!');
      });
  };

  return (
    <button
      className="brutal-cpb__cart"
      onClick={handleAddToCart}
      disabled={product.inventory && !product.inventory.isInStock}
    >
      В корзину
    </button>
  );
}
