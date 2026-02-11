// src/pages/business-image/_helpers.js
import { API_BASE_URL } from "../../api/endpoints";

export const PLACEHOLDER = "/placeholder.png";

export const imgUrl = (img) => {
  if (!img) return PLACEHOLDER;
  if (typeof img !== "string") return PLACEHOLDER;
  if (img.startsWith("http")) return img;
  return `${API_BASE_URL}${img}`;
};
