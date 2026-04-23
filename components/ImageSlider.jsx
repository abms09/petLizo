import { useState } from "react";

export default function ImageSlider({ images = [] }) {
  const [selected, setSelected] = useState(0);
  const [preview, setPreview] = useState(null);

  const getImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/300";

    let clean = img.replace(/\\/g, "/").replace("uploads/", "");
    return `http://localhost:5000/uploads/${clean}`;
  };

  if (!images || images.length === 0) {
    return (
      <img
        src="https://via.placeholder.com/300"
        className="h-40 w-full object-cover rounded"
        alt="no-img"
      />
    );
  }

  return (
    <>
      <div>
        <img
          src={getImageUrl(images[selected])}
          alt="pet"
          onClick={() => setPreview(getImageUrl(images[selected]))} // 🔥 click to preview
          className="h-64 md:h-80 w-full object-cover rounded mb-2 cursor-pointer hover:opacity-90"
        />

        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <img
              key={i}
              src={getImageUrl(img)}
              alt="thumb"
              onClick={() => setSelected(i)}
              className={`h-16 w-16 object-cover rounded cursor-pointer border-2 ${
                selected === i ? "border-blue-500" : "border-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {preview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setPreview(null)} // close on click
        >
          <img
            src={preview}
            className="max-h-[90%] max-w-[90%] rounded-lg shadow-lg"
            alt="preview"
          />

          <button
            className="absolute top-5 right-5 text-white text-3xl"
            onClick={() => setPreview(null)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}