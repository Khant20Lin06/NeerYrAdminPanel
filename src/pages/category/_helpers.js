// src/pages/category/_helpers.js
import { API_BASE_URL } from "../../api/endpoints";

export const PLACEHOLDER = "/placeholder.png";

export const imgUrl = (img, imgUrlField) => {
  // prefer backend image_url if exists
  if (imgUrlField) return imgUrlField;
  if (!img) return PLACEHOLDER;
  if (typeof img !== "string") return PLACEHOLDER;
  if (img.startsWith("http")) return img;
  return `${API_BASE_URL}${img}`;
};
