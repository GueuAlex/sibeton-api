import React, { useState, ChangeEvent, FormEvent } from "react";
import { z } from "zod";

interface ProductFormState {
  label: string;
  description: string;
  categoryId: string;
  cover: File | null;
  images: File[];
}

const productSchema = z.object({
  label: z
    .string()
    .min(1, "Le nom du produit est requis")
    .max(100, "Le nom du produit ne doit pas dépasser 100 caractères"),
  description: z
    .string()
    .max(1000, "La description ne doit pas dépasser 1000 caractères"),
  categoryId: z.string().min(1, "La catégorie est requise"),
});

const CreateProductForm: React.FC = () => {
  const [formState, setFormState] = useState<ProductFormState>({
    label: "",
    description: "",
    categoryId: "",
    cover: null,
    images: [],
  });
  const [errors, setErrors] = useState<Partial<ProductFormState>>({});

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    try {
      productSchema.parse(formState);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.flatten().fieldErrors);
        return;
      }
    }

    const formData = new FormData();
    formData.append("label", formState.label);
    formData.append("description", formState.description);
    formData.append("categoryId", formState.categoryId);
    if (formState.cover) {
      formData.append("cover", formState.cover);
    }
    formState.images.forEach((image) => {
      formData.append("images", image);
    });
    /* console.log({
      label: formState.label,
      description: formState.description,
      categoryId: formState.categoryId,
      cover: formState.cover,
      images: [...formState.images],
    });
    return; */

    try {
      const response = await fetch(
        "https://sibeton-api.vercel.app/api/product/1",
        {
          method: "PUT",
          body: formData,
          credentials: 'include',
        }
        
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Produit créé avec succès:", data);
        // Réinitialiser le formulaire ou rediriger l'utilisateur
      } else {
        const errorData = await response.json();
        console.error("Erreur lors de la création du produit:", errorData);
        setErrors(errorData.errors || {});
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire:", error);
    }
  };

  return (
    <form className="product-form" style={styles.form} onSubmit={handleSubmit}>
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
        {errors.label && <p style={styles.error}>{errors.label}</p>}
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
        {errors.description && <p style={styles.error}>{errors.description}</p>}
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
          <option value="1">Béton prêt à l'emploi</option>
          <option value="2">Béton préfabriqué</option>
          <option value="3">Béton précontraint</option>
        </select>
        {errors.categoryId && <p style={styles.error}>{errors.categoryId}</p>}
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
  error: {
    color: "red",
    fontSize: "0.8em",
    marginTop: "5px",
  },
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
