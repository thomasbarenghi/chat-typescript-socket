require("dotenv").config();
const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;
const cloudinary = require("../../config/cloudinary");
const fs = require("fs");
const path = require("path");

async function uploadImage(message) {
  if (message.image) {
    try {
      const image = Buffer.from(message.image.file, "base64");
      const folderPath = "../../uploads";
      const filename = `${message.image.fileName}`;
      const filePath = path.join(__dirname, folderPath, filename);
      console.log("filePath", filePath);
      fs.writeFile(filePath, image, (err) => {
        if (err) {
          throw err;
        }
        console.log("¡El archivo se ha guardado en:", filePath, "!");
      });

      const result = await cloudinary.uploader.upload(filePath, {
        folder: "uploads",
      });

      const imageUrl = result.url;

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Archivo borrado");
      });

      return imageUrl;
    } catch (error) {
      console.log("error cloud", error.message);
    }
  } else {
    return null;
  }
}

module.exports = {
  uploadImage,
};
