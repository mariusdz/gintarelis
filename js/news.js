document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("newsContainer");

  fetch("https://www.klaipedosgiliukas.lt/wp-json/wp/v2/posts?categories=1&per_page=3&_embed")
    .then(res => res.json())
    .then(posts => {
      container.innerHTML = posts.map(post => {
        
        const title = post.title.rendered;
        const link = post.link;
        const date = new Date(post.date).toLocaleDateString("lt-LT");
        
        const img =
          post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ??
          "img/placeholder.jpg";

        return `
        <article class="bg-white shadow-lg rounded-xl overflow-hidden hover:scale-[1.02] transition">
          <a href="${link}" target="_blank">
            <img src="${img}" class="w-full h-48 object-cover" />
          </a>

          <div class="p-5">
            <p class="text-sm text-gray-500 mb-2">${date}</p>
            <h3 class="text-xl font-bold text-[#005f88] mb-3">
              ${title}
            </h3>
            <a href="${link}" target="_blank" 
              class="text-[#2596be] font-semibold hover:underline">
              Skaityti daugiau →
            </a>
          </div>
        </article>
        `;
      }).join("");
    })
    .catch(err => {
      container.innerHTML = `<p class="text-center text-red-600">Nepavyko įkelti naujienų.</p>`;
      console.error("WP naujienų klaida:", err);
    });
});
