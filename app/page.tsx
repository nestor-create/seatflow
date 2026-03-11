
            alert(
              `${airlineKey} — ${cabin}\n` +
                `Product: ${product.name}\n` +
                `Since: ${product.since ?? "—"}\n` +
                `Status: ${product.isNew ? "NEW PRODUCT" : "Existing"}`
            );
          }}
        >
          New product?
        </button>
      </div>

      {product && (
        <div style={{ marginTop: 20 }}>
          <strong>
            Latest Product: {product.name}{" "}
            {product.isNew && <span style={badge}>NEW</span>}
          </strong>
        </div>
      )}
    </main>
  );
}

/* ===========================
   STYLES
   =========================== */

const inputStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ddd",
};

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  cursor: "pointer",
  background: "white",
};

const badge: React.CSSProperties = {
  display: "inline-block",
  marginLeft: 6,
  padding: "2px 8px",
  borderRadius: 999,
  border: "1px solid #ddd",
  fontSize: 12,
};