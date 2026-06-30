import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "src/data");

function featureFrom(nominatimFile, props) {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, nominatimFile), "utf8"));
  return {
    type: "Feature",
    properties: props,
    geometry: data[0].geojson,
  };
}

const geojson = {
  type: "FeatureCollection",
  features: [
    featureFrom("nominatim-hail.json", {
      id: "hail",
      name: "منطقة حائل",
      subtitle: "نطاق خدمة منصة عَود · شمال المملكة",
    }),
    featureFrom("nominatim-qassim.json", {
      id: "qassim",
      name: "منطقة القصيم",
      subtitle: "نطاق خدمة منصة عَود · وسط المملكة",
    }),
  ],
};

const out = path.join(dataDir, "regions-boundaries.json");
fs.writeFileSync(out, JSON.stringify(geojson));
console.log("Saved", out, "features:", geojson.features.length);
