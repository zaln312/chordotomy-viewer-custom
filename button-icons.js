// The inline icons for the bar's toggle buttons, kept apart from the page structure.
(() => {
  "use strict";

  const ICONS = [
    {
      button: "guitar-view",
      className: "instrument-icon",
      icons: [
        {
          choice: "piano",
          viewBox: "0 0 24 24",
          content: `
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" />
            <path d="M9 19v-6" />
            <path d="M8 5v8h2v-8" />
            <path d="M15 19v-6" />
            <path d="M14 5v8h2v-8" />
          `,
        },
        {
          choice: "guitar",
          viewBox: "0 0 32 32",
          strokeWidth: 8 / 3,
          content: `
            <path stroke="none" d="M0 0h32v32H0z" fill="none" />
            <path d="M20.4 24.8l1.5-3.9c0.4-1.1 1.3-2.1 2.4-2.7c3.2-1.7 3.7-6.1 1-8.8l-2.3-2.3c-2.7-2.7-7.1-2.2-8.8 1c-0.6 1.1-1.5 1.9-2.7 2.4l-3.9 1.5c-4.6 1.8-5.6 7.8-2 11.4L9 26.8C12.7 30.4 18.6 29.4 20.4 24.8z" />
            <circle cx="18.2" cy="14.3" r="2.9" />
            <path d="M9.7 19.1l3.7 3.7" />
            <path d="M26.3 3.5l-3.4 3.4l2.7 2.7l3.4-3.4" />
          `,
        },
      ],
    },
    {
      button: "theme-toggle",
      className: "theme-icon",
      icons: [
        {
          choice: "auto",
          viewBox: "0 0 24 24",
          content: `
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M12 3v18" />
            <path d="M12 14l7 -7" />
            <path d="M12 19l8.5 -8.5" />
            <path d="M12 9l4.5 -4.5" />
          `,
        },
        {
          choice: "light",
          viewBox: "0 0 24 24",
          content: `
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path
              d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"
            />
          `,
        },
        {
          choice: "dark",
          viewBox: "0 0 24 24",
          content: `
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path
              d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008"
            />
          `,
        },
      ],
    },
  ];

  const SVG_NS = "http://www.w3.org/2000/svg";
  const createIcon = (className, icon) => {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.classList.add(className);
    svg.dataset.choice = icon.choice;
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", icon.viewBox);
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", String(icon.strokeWidth ?? 2));
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = icon.content.trim();
    return svg;
  };

  for (const { button, className, icons } of ICONS) {
    document.getElementById(button).append(
      ...icons.map((icon) => createIcon(className, icon)),
    );
  }
})();
