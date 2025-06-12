<script>
document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('productPopup');
  const popupContent = document.getElementById('popupContent');
  const closeBtn = document.querySelector('.popup-close');
  const openButtons = document.querySelectorAll('.product-popup-btn');

  if (!popup || !popupContent || !openButtons.length) {
    console.warn("Popup not found or no buttons present.");
    return;
  }

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const handle = btn.closest('.grid-item').dataset.productHandle;
      if (!handle) return;

      fetch(`/products/${handle}.js`)
        .then(res => res.json())
        .then(product => {
          let variantOptions = '';
          const colors = [];

          // 🔁 Loop & collect colors from option1 manually (first level color)
          product.variants.forEach((variant, index) => {
            const colorName = variant.option1;
            const colorNormalized = colorName.toLowerCase();
            if (!colors.includes(colorName)) {
              // Use color name as border color via inline style
              variantOptions += `
                <button
                  class="color-btn"
                  data-variant="${variant.id}"
                  style="border-left: 6px solid ${colorNormalized};"
                >
                  ${colorName}
                </button>
              `;
              colors.push(colorName);
            }
          });

          popupContent.innerHTML = `
            <img src="${product.featured_image}" alt="${product.title}" />
            <h2>${product.title}</h2>
            <p><strong>Price:</strong> $${(product.price / 100).toFixed(2)}</p>
            <p>${product.description}</p>

            <label><strong>Color</strong></label>
            <div class="color-option-set">${variantOptions}</div>

            <button class="add-to-cart">Add to Cart</button>
          `;

          // 💡 Add styles dynamically
          const style = document.createElement('style');
          style.textContent = `
            .color-option-set {
              display: flex;
              border: 1px solid #000;
              overflow: hidden;
              margin-bottom: 20px;
            }

            .color-btn {
              flex: 1;
              padding: 10px;
              border: none;
              background: #fff;
              font-size: 14px;
              border-right: 1px solid black;
              cursor: pointer;
              position: relative;
            }

            .color-btn:last-child {
              border-right: none;
            }

            .color-btn.active {
              font-weight: bold;
              outline: 2px solid black;
              outline-offset: -2px;
            }
          `;
          document.head.appendChild(style);

          // 🧠 Variant selection functionality
          let selectedVariantId = null;

          const colorBtns = popupContent.querySelectorAll(".color-btn");
          colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
              // Remove active class from all
              colorBtns.forEach(b => b.classList.remove("active"));
              btn.classList.add("active");

              selectedVariantId = btn.dataset.variant;
            });
          });

          popup.style.display = 'flex';

          popupContent.querySelector('.add-to-cart').addEventListener('click', () => {
            if (!selectedVariantId) {
              alert("Please select a color.");
              return;
            }

            fetch('/cart/add.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: selectedVariantId, quantity: 1 })
            }).then(() => {
              // ✅ Auto-add soft jacket if Black + Medium (just in case)
              fetch(`/variants/${selectedVariantId}.js`)
                .then(r => r.json())
                .then(variant => {
                  const title = variant.title.toLowerCase();
                  if (title.includes("black") && title.includes("medium")) {
                    const softJacketVariantId = 40932412548286;
                    fetch('/cart/add.js', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: softJacketVariantId, quantity: 1 })
                    });
                  }
                });

              popup.style.display = 'none';
            });
          });
        }).catch(err => {
          console.error("ERROR:", err);
          popupContent.innerHTML = "<p>Error loading product!</p>";
        });
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
    });
  }
});
</script>
