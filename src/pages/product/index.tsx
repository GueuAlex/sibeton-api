import React, { useState, ChangeEvent } from "react";

interface ProductFormState {
  label: string;
  description: string;
  categoryId: string;
  cover: File | null;
  images: File[];
}

const CreateProductForm: React.FC = () => {
  const [formState, setFormState] = useState<ProductFormState>({
    label: "",
    description: "",
    categoryId: "",
    cover: null,
    images: [],
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormState((prevState) => ({
        ...prevState,
        [name]: name === "cover" ? files[0] : Array.from(files),
      }));
    }
  };

  return (
    <form className="product-form" style={styles.form}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Créer un Produit
      </h2>

      <div style={styles.field}>
        <label htmlFor="label">Nom du Produit</label>
        <input
          type="text"
          id="label"
          name="label"
          value={formState.label}
          onChange={handleInputChange}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formState.description}
          onChange={handleInputChange}
          style={styles.textarea}
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="categoryId">Catégorie</label>
        <select
          id="categoryId"
          name="categoryId"
          value={formState.categoryId}
          onChange={handleInputChange}
          style={styles.select}
        >
          <option value="" disabled>
            Sélectionner une catégorie
          </option>
          <option value="1">Catégorie 1</option>
          <option value="2">Catégorie 2</option>
          <option value="3">Catégorie 3</option>
        </select>
      </div>

      <div style={styles.field}>
        <label htmlFor="cover">Image de couverture</label>
        <input
          type="file"
          id="cover"
          name="cover"
          accept="image/*"
          onChange={handleFileChange}
          style={styles.fileInput}
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="images">Images du Produit</label>
        <input
          type="file"
          id="images"
          name="images"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={styles.fileInput}
        />
      </div>

      <button type="submit" style={styles.submitButton}>
        Enregistrer le Produit
      </button>
    </form>
  );
};

const styles = {
  form: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  field: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  textarea: {
    width: "100%",
    height: "80px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  fileInput: {
    display: "block",
    width: "100%",
    padding: "10px",
  },
  submitButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default CreateProductForm;
