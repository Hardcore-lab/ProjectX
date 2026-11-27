import React, { useState, useMemo } from 'react';
import { createClient, Provider, useQuery } from 'urql';
import CartAddToCartButton from './CartAddToCartButton';

const client = createClient({
  url: '/api/graphql'
});

const CategoriesQuery = `
  query {
    categories(filters: [{key: "limit", operation: eq, value: "1000"}]) {
      items {
        categoryId
        name
        urlKey
        parent {
          categoryId
          name
        }
      }
    }
  }
`;

const BrandsQuery = `
  query {
    collections(filters: [{key: "limit", operation: eq, value: "1000"}])  {
      items {
        collectionId
        name
      }
    }
  }
`;

const ProductsQuery = `
  query {
    products(filters: [{key: "limit", operation: eq, value: "10000"}])  {
      items {
        productId
        name
        urlKey
        image { url }
        category { categoryId name }
        collections { collectionId name }
        price {
          regular { value text }
          special { value text }
        }
        sku
      }
    }
  }
`;

function CategoryProductBlock() {
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Категории
  const [catResult] = useQuery({ query: CategoriesQuery });
  const { data: catData, fetching: catLoading, error: catError } = catResult;

  // Бренды (collections)
  const [brandResult] = useQuery({ query: BrandsQuery });
  const { data: brandData, fetching: brandLoading, error: brandError } = brandResult;

  // Все товары
  const [prodResult] = useQuery({ query: ProductsQuery });
  const { data: prodData, fetching: prodLoading, error: prodError } = prodResult;
  function getProductUrl(product, categories) {
  if (!product.category || !categories) return `/product/${product.urlKey}`;

  const productCategory = categories.find(cat => cat.categoryId === product.category.categoryId);

  if (!productCategory) {
    console.warn('Категория товара не найдена:', product);
    return `/product/${product.urlKey}`;
  }

  let mainCategory = productCategory;
  let subCategory = null;

  if (productCategory.parent) {
    mainCategory = categories.find(cat => cat.categoryId === productCategory.parent.categoryId) || productCategory;
    subCategory = productCategory;
  }

  let url = `/${mainCategory.urlKey ?? 'unknown'}`;
  if (subCategory) {
    url += `/${subCategory.urlKey ?? 'unknown'}`;
  }
  url += `/${product.urlKey}`;
  return url;
}

  // При первой загрузке выбираем первую главную категорию
  React.useEffect(() => {
    if (
      !selectedMainCategory &&
      catData?.categories?.items?.length > 0
    ) {
      const firstMain = catData.categories.items.find((cat) => !cat.parent);
      setSelectedMainCategory(firstMain);
      setSelectedSubCategory(null);
    }
  }, [catData, selectedMainCategory]);

  // Список подкатегорий для выбранной главной
  const subCategories = useMemo(() => {
    if (!catData?.categories?.items || !selectedMainCategory) return [];
    return catData.categories.items.filter(
      (cat) =>
        cat.parent &&
        cat.parent.categoryId === selectedMainCategory.categoryId
    );
  }, [catData, selectedMainCategory]);

  // Главные категории
  const mainCategories = useMemo(() => {
    if (!catData?.categories?.items) return [];
    return catData.categories.items.filter((cat) => !cat.parent);
  }, [catData]);

  // Для фильтрации всех товаров по главной + её подкатегориям
  const mainCatAndSubIds = useMemo(() => {
    if (!catData?.categories?.items || !selectedMainCategory) return [];
    const subcatIds = catData.categories.items
      .filter(
        (cat) =>
          cat.parent &&
          cat.parent.categoryId === selectedMainCategory.categoryId
      )
      .map((cat) => cat.categoryId);
    return [selectedMainCategory.categoryId, ...subcatIds];
  }, [catData, selectedMainCategory]);

  // Фильтрация по категории/подкатегории/бренду
  const filteredProducts = useMemo(() => {
    if (!prodData?.products?.items) return [];
    let result = prodData.products.items;
    if (selectedSubCategory) {
      result = result.filter(
        (product) =>
          product.category &&
          product.category.categoryId === selectedSubCategory.categoryId
      );
    } else if (selectedMainCategory) {
      result = result.filter(
        (product) =>
          product.category &&
          mainCatAndSubIds.includes(product.category.categoryId)
      );
    }
    if (selectedBrand) {
      result = result.filter(
        (product) =>
          product.collections &&
          product.collections.some(
            (c) => c.collectionId === selectedBrand.collectionId
          )
      );
    }
    return result;
  }, [
    prodData,
    selectedMainCategory,
    selectedSubCategory,
    selectedBrand,
    mainCatAndSubIds,
  ]);

  return (
    <div className="brutal-cpb__bg">
      <div className="brutal-cpb__container">
        <aside className="brutal-cpb__sidebar">
  <h3 style={{paddingBottom: 10, textAlign: 'center'}}>Категории</h3>
{catLoading ? (
  <p>Загрузка...</p>
) : catError ? (
  <p>Ошибка: {catError.message}</p>
) : (
  <ul>
  {catData.categories.items
    .filter((cat) => !cat.parent)
    .map((cat) => (
      <React.Fragment key={cat.categoryId}>
        <li
  onClick={() => {
    if (selectedMainCategory?.categoryId !== cat.categoryId) {
      // Выбрали новую главную категорию
      setSelectedMainCategory(cat);
      setSelectedSubCategory(null);
    } else if (selectedSubCategory) {
      // Клик по уже выбранной главной и есть выбранная подкатегория
      setSelectedSubCategory(null);
    }
    // Если клик по выбранной главной и подкатегория не выбрана — ничего не делаем
  }}
  className={`brutal-cpb__cat ${
    selectedMainCategory?.categoryId === cat.categoryId
      ? 'brutal-cpb__cat--active'
      : ''
  }`}
  style={{cursor: 'pointer'}}
>
  {cat.name}
</li>

        {/* Подкатегории — только под выбранной */}
        {selectedMainCategory?.categoryId === cat.categoryId && (
          <ul style={{paddingLeft: 22, margin: 0}}>
            {catData.categories.items
              .filter(
                (subcat) =>
                  subcat.parent &&
                  subcat.parent.categoryId === cat.categoryId
              )
              .map((subcat) => (
                <li
                  key={subcat.categoryId}
                  onClick={(e) => {
                    e.stopPropagation();
                    // здесь важна именно проверка по id!
                    setSelectedSubCategory(
                      selectedSubCategory?.categoryId === subcat.categoryId
                        ? null // снимаем выбор, если клик по выбранной
                        : subcat
                    );
                  }}
                  className={`brutal-cpb__cat ${
                    selectedSubCategory?.categoryId === subcat.categoryId
                      ? 'brutal-cpb__cat--active'
                      : ''
                  }`}
                >
                  {subcat.name}
                </li>
              ))}
          </ul>
        )}
      </React.Fragment>
    ))}
</ul>

)}



          <hr style={{ border: 'none', borderTop: '1px solid #232325', margin: '18px 0 12px 0' }} />
          <h3 style={{paddingBottom: 10, textAlign: 'center'}}>Бренды</h3>
          {brandLoading ? (
            <p>Загрузка...</p>
          ) : brandError ? (
            <p>Ошибка: {brandError.message}</p>
          ) : (
            <ul>
              <li
                onClick={() => setSelectedBrand(null)}
                className={!selectedBrand ? 'brutal-cpb__cat brutal-cpb__cat--active' : 'brutal-cpb__cat'}
                style={{ fontStyle: 'italic', color: '#aaa' }}
              >
                Все бренды
              </li>
              {brandData.collections.items.map((brand) => (
                <li
                  key={brand.collectionId}
                  onClick={() => setSelectedBrand(brand)}
                  className={`brutal-cpb__cat ${selectedBrand?.collectionId === brand.collectionId ? 'brutal-cpb__cat--active' : ''}`}
                >
                  {brand.name}
                </li>
              ))}
            </ul>
          )}
        </aside>
        <main className="brutal-cpb__main">
          {prodLoading ? (
            <p>Загрузка товаров...</p>
          ) : prodError ? (
            <p>Ошибка: {prodError.message}</p>
          ) : (
            <div className="brutal-cpb__grid">
              {filteredProducts.map((product) => {
                const hasDiscount =
                  product.price.special.value > 0 &&
                  product.price.special.value < product.price.regular.value;
                return (
                  <div key={product.productId} className="brutal-cpb__card">
                    <div className="brutal-cpb__imgwrap">
                      {product.image?.url ? (
                        <img src={product.image.url} alt={product.name} className="brutal-cpb__img" />
                      ) : (
                        <div className="brutal-cpb__noimg">Нет фото</div>
                      )}
                      {hasDiscount && (
                        <div className="brutal-cpb__badge">SALE</div>
                      )}
                    </div>
                    <p className="brutal-cpb__name">{product.name}</p>
                    <div className="brutal-cpb__price-wrap">
                      {hasDiscount ? (
                        <>
                          <span className="brutal-cpb__price--old">{product.price.regular.text}</span>
                          <span className="brutal-cpb__price--new">{product.price.special.text}</span>
                        </>
                      ) : (
                        <span className="brutal-cpb__price--reg">{product.price.regular.text}</span>
                      )}
                    </div>
                    <div className="brutal-cpb__btns">
  <CartAddToCartButton product={product} />
  
  <a href={
    catData?.categories?.items
      ? getProductUrl(product, catData.categories.items)
      : `/product/${product.urlKey}`
  }className="brutal-cpb__more">
    Подробнее
  </a>
</div>

                  </div>
                );
              })}
              {!filteredProducts.length && !prodLoading && (
                <div className="brutal-cpb__empty">Нет товаров под выбранные фильтры</div>
              )}
            </div>
          )}
        </main>
      <style>{`
      .brutal-cpb__cart {
  color: #fff;
  background: #222d18;                 /* Зеленоватый, холодный оттенок */
  outline: none;
  border-radius: 3px;
  padding: 10px 22px;
  font-weight: 800;
  font-size: 1.03rem;
  letter-spacing: 1.15px;
  text-transform: uppercase;
  margin-top: 11px;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s, color 0.15s, border-color 0.14s;
  text-decoration: none;
  display: inline-block;
  min-width: 110px;
  margin-left: 10px;
}

.brutal-cpb__cart:hover {
  background: #43ffa3;
  color: #18191d;
  border-color: #43ffa3;
}

.brutal-cpb__cart:disabled {
  background: #3a3a3a;
  color: #bbb;
  border-color: #232325;
  opacity: 0.7;
  cursor: not-allowed;
}

      .brutal-cpb__bg {
  background: #131417;
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  min-width: 100vw;
  box-sizing: border-box;
  padding: 0;
  z-index: 0;
}
.brutal-cpb__container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  max-width: 1240px;
  margin: 0 auto;
  padding: 38px 16px 32px 16px;
  box-sizing: border-box;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
  background: none;
}
.brutal-cpb__sidebar {
  min-width: 300px;
  background: #18191d;
  border-radius: 7px;
  border: 1.5px solid #232325;
  padding: 18px 18px 18px 12px;
  color: #f2f2f2;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  box-sizing: border-box;
}
.brutal-cpb__sidebar ul {
  padding: 0;
  margin: 0;
  list-style: none;
}
.brutal-cpb__cat {
  cursor: pointer;
  padding: 13px 18px;
  margin-bottom: 8px;
  border-left: 4px solid transparent;
  border-radius: 0 5px 5px 0;
  font-size: 1rem;
  color: #bbb;
  font-weight: 500;
  background: none;
  transition: background 0.13s, color 0.13s, border 0.16s;
  box-sizing: border-box;
}
.brutal-cpb__cat--active, .brutal-cpb__cat:hover {
  border-left: 4px solid #8b1111;
  background: #202024;
  color: #fff;
  font-weight: 700;
}
.brutal-cpb__main {
  flex: 1;
  min-width: 0;
  color: #f2f2f2;
  box-sizing: border-box;
}
.brutal-cpb__grid {
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 2rem;
  margin-top: 10px;
  width: 100%;
  box-sizing: border-box;
}
.brutal-cpb__grid:only-child,
.brutal-cpb__grid:has(.brutal-cpb__card:nth-child(3)) {
  justify-content: center;
}
.brutal-cpb__card {
  background: #18191d;
  border: 1.5px solid #2c2c31;
  border-radius: 7px;
  box-shadow: none;
  padding: 24px 16px 18px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: border-color 0.14s, background 0.14s;
  position: relative;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  max-width: 360px;
}
.brutal-cpb__card:hover {
  border-color: #8b1111;
  background: #232325;
}
.brutal-cpb__imgwrap {
  width: 100%;
  position: relative;
}
.brutal-cpb__badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #8b1111;
  color: #fff;
  font-weight: 900;
  padding: 4px 13px;
  border-radius: 0 8px 0 8px;
  font-size: 0.98rem;
  letter-spacing: 0.7px;
  border: none;
}
.brutal-cpb__img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 12px;
  background: #222;
  border: 1px solid #232325;
  min-width: 0;
  box-sizing: border-box;
  display: block;
}
.brutal-cpb__noimg {
  width: 100%;
  height: 200px;
  border-radius: 5px;
  background: #232325;
  color: #8b1111;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border: 1px dashed #39393d;
  font-size: 1rem;
  min-width: 0;
  box-sizing: border-box;
  opacity: 0.88;
}
.brutal-cpb__name {
  font-size: 1.14rem;
  margin: 9px 0 6px 0;
  font-weight: 700;
  color: #f2f2f2;
  text-align: center;
  letter-spacing: 0.2px;
}
.brutal-cpb__price-wrap {
  margin-bottom: 12px;
  display: flex;
  gap: 1em;
  align-items: baseline;
  font-size: 1.14rem;
  flex-wrap: wrap;
}
.brutal-cpb__price--reg, .brutal-cpb__price--new {
  color: #8b1111;
  font-weight: 800;
  font-size: 1.13em;
  letter-spacing: 0.15px;
}
.brutal-cpb__price--old {
  color: #bababa;
  font-size: 1em;
  text-decoration: line-through;
  font-weight: 500;
  opacity: 0.75;
}
.brutal-cpb__more {
  color: #fff;
  background: #8b1111;
  border: 1.5px solid #8b1111;
  outline: none;
  border-radius: 3px;
  padding: 10px 22px;
  font-weight: 800;
  font-size: 1.03rem;
  letter-spacing: 1.15px;
  text-transform: uppercase;
  margin-top: 11px;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s, color 0.15s, border-color 0.14s;
  text-decoration: none;
  display: inline-block;
  min-width: 110px;
}
.brutal-cpb__more:hover {
  background: #fff;
  color: #8b1111;
  border-color: #fff;
}
.brutal-cpb__empty {
  color: #8b1111;
  padding: 2em 0;
  text-align: center;
  font-size: 1.14rem;
  font-weight: 600;
}
@media (max-width: 900px) {
  .brutal-cpb__container {
    flex-direction: column;
    gap: 1rem;
    padding: 15px 7px;
    min-width: 0;
  }
  .brutal-cpb__sidebar {
    min-width: 0;
    padding: 10px 6px 10px 6px;
    border-right: none;
    border-bottom: 3px solid #8b1111;
  }
  .brutal-cpb__grid {
    justify-content: center;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
}
@media (max-width: 600px) {
  .brutal-cpb__bg {
    padding: 0;
  }
  .brutal-cpb__container {
    padding: 0 2px;
    min-width: 0;
  }
  .brutal-cpb__main, .brutal-cpb__sidebar {
    min-width: 0;
  }
  .brutal-cpb__grid {
    grid-template-columns: 1fr;
    gap: 0.6rem;
    width: 80%;
    margin-left: 10%;
    min-width: 0;
    justify-content: center;
  }
  .brutal-cpb__card {
    padding: 9px 6px 9px 6px;
    margin-bottom: 15px;
    min-width: 0;
    max-width: 99vw;
  }
}
html, body, #app, main, .brutal-cpb__bg, .brutal-cpb__container {
  min-width: 0 !important;
  box-sizing: border-box;
  overflow-x: hidden !important;
}




      `}</style>
    </div>
    </div>
  );
}

function FreeShippingBar() {
  return (
    <Provider value={client}>
      <CategoryProductBlock />
    </Provider>
  );
}

export default FreeShippingBar;

export const layout = {
  areaId: "content",
  sortOrder: 2,
};
