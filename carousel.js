function setupCarousel(carouselId) {
    const container = document.getElementById(carouselId);
    const images = Array.from(container.querySelectorAll("img"));
    const desc = container.nextElementSibling;

    let currentIndex = 0;
    let intervalId;

    images.forEach((img, i) => {
        img.style.position = "absolute";
        img.style.inset = "0";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        img.style.transition = "transform 0.5s ease-in-out";
        img.style.transform = `translateX(${i * 100}%)`;
        img.style.cursor = "pointer";
    });

    function showImage(index) {
        images.forEach((img, i) => {
            img.style.transform = `translateX(${(i - index) * 100}%)`;
        });

        desc.classList.remove("active");
        setTimeout(() => {
            desc.textContent = images[index].dataset.desc;
            desc.classList.add("active");
        }, 200);
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    }

    function startAuto() {
        intervalId = setInterval(nextImage, 7000);
    }

    function stopAuto() {
        clearInterval(intervalId);
    }

    container.append(
        Object.assign(document.createElement("button"), {
            textContent: "<",
            className: "carousel-arrow prev",
            onclick: () => { stopAuto(); prevImage(); startAuto(); }
        }),
        Object.assign(document.createElement("button"), {
            textContent: ">",
            className: "carousel-arrow next",
            onclick: () => { stopAuto(); nextImage(); startAuto(); }
        })
    );

    /* ================= LIGHTBOX ================= */

    function createLightbox() {
        const lightbox = document.createElement("div");
        const imgEl = document.createElement("img");
        const descEl = document.createElement("p");
        const closeBtn = document.createElement("span");

        let scale = 1;
        let tx = 0;
        let ty = 0;

        let dragging = false;
        let lastX = 0;
        let lastY = 0;

        let startDistance = 0;
        let startScale = 1;

        imgEl.draggable = false; // 🔥 IMPORTANT

        function clamp() {
            const rect = imgEl.getBoundingClientRect();
            const maxX = Math.max(0, (rect.width - window.innerWidth) / 2);
            const maxY = Math.max(0, (rect.height - window.innerHeight) / 2);

            tx = Math.min(Math.max(tx, -maxX), maxX);
            ty = Math.min(Math.max(ty, -maxY), maxY);
        }

        function apply() {
            clamp();
            imgEl.style.transform =
                `translate(${tx}px, ${ty}px) scale(${scale})`;
        }

        lightbox.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.9);
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            z-index: 9999;
            overflow: hidden;
        `;

        imgEl.style.maxWidth = "90%";
        imgEl.style.maxHeight = "80%";
        imgEl.style.cursor = "grab";
        imgEl.style.transformOrigin = "center center";
        imgEl.style.touchAction = "none";
        imgEl.style.userSelect = "none";

        descEl.style.color = "white";
        descEl.style.marginTop = "10px";

        closeBtn.innerHTML = "&times;";
        closeBtn.style.cssText = `
            position:absolute;
            top:20px;
            right:30px;
            font-size:32px;
            color:white;
            cursor:pointer;
        `;

        closeBtn.onclick = () => {
            scale = 1;
            tx = 0;
            ty = 0;
            apply();
            lightbox.style.display = "none";
        };

        /* ===== DESKTOP ZOOM ===== */
        imgEl.addEventListener("wheel", e => {
            e.preventDefault();

            scale += e.deltaY * -0.002;
            scale = Math.min(Math.max(scale, 1), 5);

            if (scale === 1) {
                tx = 0;
                ty = 0;
            }

            apply();
        }, { passive: false });

        /* ===== DESKTOP DRAG (SAME AS MOBILE) ===== */
        imgEl.addEventListener("mousedown", e => {
            if (scale === 1 || e.button !== 0) return;
            e.preventDefault(); // 🔥 STOPS BROWSER IMAGE DRAG

            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            imgEl.style.cursor = "grabbing";
        });

        window.addEventListener("mousemove", e => {
            if (!dragging) return;

            tx += e.clientX - lastX;
            ty += e.clientY - lastY;

            lastX = e.clientX;
            lastY = e.clientY;

            apply();
        });

        window.addEventListener("mouseup", () => {
            dragging = false;
            imgEl.style.cursor = "grab";
        });

        /* ===== MOBILE PINCH + DRAG ===== */
        imgEl.addEventListener("touchstart", e => {
            if (e.touches.length === 2) {
                startDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                startScale = scale;
            } else if (e.touches.length === 1 && scale > 1) {
                dragging = true;
                lastX = e.touches[0].clientX;
                lastY = e.touches[0].clientY;
            }
        }, { passive: false });

        imgEl.addEventListener("touchmove", e => {
            e.preventDefault();

            if (e.touches.length === 2) {
                const d = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );

                scale = startScale * (d / startDistance);
                scale = Math.min(Math.max(scale, 1), 5);

                if (scale === 1) {
                    tx = 0;
                    ty = 0;
                }
            }

            if (e.touches.length === 1 && dragging) {
                tx += e.touches[0].clientX - lastX;
                ty += e.touches[0].clientY - lastY;

                lastX = e.touches[0].clientX;
                lastY = e.touches[0].clientY;
            }

            apply();
        }, { passive: false });

        imgEl.addEventListener("touchend", () => dragging = false);

        lightbox.append(closeBtn, imgEl, descEl);
        document.body.appendChild(lightbox);
        return { lightbox, imgEl, descEl };
    }

    const { lightbox, imgEl, descEl } = createLightbox();

    images.forEach(img => {
        img.addEventListener("click", () => {
            imgEl.src = img.src;
            descEl.textContent = img.dataset.desc;
            lightbox.style.display = "flex";
        });
    });

    showImage(currentIndex);
    startAuto();
}

setupCarousel("customer-carousel");
setupCarousel("admin-carousel");