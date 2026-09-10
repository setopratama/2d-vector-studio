// src/utils/vectorGraphicGenerator.ts
/**
 * Utility to produce clean 2D vector graphics (SVG Data URL)
 * Conforming strictly to 2D vector autotrace standards:
 * - 1:1 Aspect Ratio (1024x1024)
 * - Isolated on pure white background (#ffffff)
 * - Solid bold contours
 * - Either Pure B&W (black ink on white) or Vibrant Flat Colors
 * - Category-Specific: Flat Vector Art, Mascot Logo, Monoline Ink, Sticker Decal, Vintage Emblem, Stencil
 */

export function generate2DVectorSvgDataUrl(
  subject: string,
  isBlackAndWhite: boolean,
  stylePreset: string = 'flat-vector',
  iteration: number = 1,
  styleVariantIndex: number = 0
): string {
  const bg = '#ffffff';

  // Palette sets for color mode
  const palettes = [
    { main: '#ea580c', sec: '#1e293b', acc: '#fbbf24' }, // Orange & Charcoal
    { main: '#2563eb', sec: '#0d9488', acc: '#f43f5e' }, // Blue & Teal & Coral
    { main: '#059669', sec: '#334155', acc: '#f59e0b' }, // Emerald & Slate & Amber
    { main: '#7c3aed', sec: '#0f172a', acc: '#38bdf8' }, // Purple & Night & Sky
    { main: '#dc2626', sec: '#18181b', acc: '#ffffff' }, // Crimson & Black
  ];

  const palette = palettes[styleVariantIndex % palettes.length];
  const mainColor = isBlackAndWhite ? '#000000' : palette.main;
  const secondaryColor = isBlackAndWhite ? '#000000' : palette.sec;
  const accentColor = isBlackAndWhite ? '#ffffff' : palette.acc;
  const strokeColor = '#000000';
  const strokeWidth = isBlackAndWhite ? '10' : '8';

  // Extract clean keyword
  const cleanSubject = subject.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase().slice(0, 24) || '2D VECTOR';

  let centralArtwork = '';

  switch (stylePreset) {
    case 'flat-vector': {
      // Pure Flat Vector: Crisp faceted polygons, sharp planes, no badge frames
      centralArtwork = `
      <g transform="scale(1.25)">
        <!-- Faceted Geometric Base -->
        <polygon points="0,-180 -140,-40 -100,140 0,200 100,140 140,-40" 
                 fill="${isBlackAndWhite ? '#000000' : secondaryColor}" 
                 stroke="${strokeColor}" 
                 stroke-width="${strokeWidth}" />
        <!-- Left Plane -->
        <polygon points="0,-180 -140,-40 0,60" 
                 fill="${isBlackAndWhite ? '#000000' : mainColor}" 
                 stroke="${strokeColor}" 
                 stroke-width="${strokeWidth}" />
        <!-- Right Plane -->
        <polygon points="0,-180 140,-40 0,60" 
                 fill="${isBlackAndWhite ? '#ffffff' : accentColor}" 
                 stroke="${strokeColor}" 
                 stroke-width="${strokeWidth}" />
        <!-- Lower Facet Left -->
        <polygon points="0,60 -100,140 0,200" 
                 fill="${isBlackAndWhite ? '#ffffff' : accentColor}" 
                 stroke="${strokeColor}" 
                 stroke-width="${strokeWidth}" />
        <!-- Lower Facet Right -->
        <polygon points="0,60 100,140 0,200" 
                 fill="${isBlackAndWhite ? '#000000' : mainColor}" 
                 stroke="${strokeColor}" 
                 stroke-width="${strokeWidth}" />
        <!-- Sharp Geometric Eyes / Core -->
        <polygon points="-70,-20 -20,-35 -30,-5" fill="${isBlackAndWhite ? '#ffffff' : '#ffffff'}" stroke="${strokeColor}" stroke-width="4" />
        <polygon points="70,-20 20,-35 30,-5" fill="${isBlackAndWhite ? '#000000' : secondaryColor}" stroke="${strokeColor}" stroke-width="4" />
      </g>
      `;
      break;
    }

    case 'mascot-logo': {
      // Bold Mascot Character with heavy contour outline
      centralArtwork = `
      <g transform="scale(1.2)">
        <!-- Outer Heavy Die-Cut Stroke Silhouette -->
        <polygon points="0,-200 -160,-50 -120,150 0,210 120,150 160,-50" 
                 fill="${strokeColor}" />
        <!-- Mascot Base -->
        <polygon points="0,-180 -140,-40 -100,130 0,190 100,130 140,-40" 
                 fill="${isBlackAndWhite ? '#000000' : mainColor}" 
                 stroke="${strokeColor}" 
                 stroke-width="8" />
        <!-- Ears / Horns -->
        <polygon points="-140,-40 -180,-190 -70,-110" 
                 fill="${isBlackAndWhite ? '#000000' : secondaryColor}" 
                 stroke="${strokeColor}" 
                 stroke-width="8" />
        <polygon points="140,-40 180,-190 70,-110" 
                 fill="${isBlackAndWhite ? '#000000' : secondaryColor}" 
                 stroke="${strokeColor}" 
                 stroke-width="8" />
        <!-- Snout / Face Mask -->
        <polygon points="0,-70 -90,-10 0,70 90,-10" 
                 fill="${isBlackAndWhite ? '#ffffff' : accentColor}" 
                 stroke="${strokeColor}" 
                 stroke-width="8" />
        <!-- Mascot Eyes -->
        <polygon points="-70,-30 -30,-45 -40,-15" fill="${isBlackAndWhite ? '#000000' : '#ffffff'}" />
        <polygon points="70,-30 30,-45 40,-15" fill="${isBlackAndWhite ? '#000000' : '#ffffff'}" />
      </g>
      `;
      break;
    }

    case 'monoline-ink': {
      // Pure Single-Weight Monoline Line Art
      centralArtwork = `
      <g transform="scale(1.2)" fill="none" stroke="${isBlackAndWhite ? '#000000' : mainColor}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="0,-180 -150,-50 -110,140 0,190 110,140 150,-50" />
        <path d="M-150,-50 L0,50 L150,-50" />
        <path d="M0,-180 L0,190" />
        <path d="M-110,140 L0,50 L110,140" />
        <circle cx="0" cy="-60" r="35" />
        <circle cx="-60" cy="-20" r="15" />
        <circle cx="60" cy="-20" r="15" />
      </g>
      `;
      break;
    }

    case 'sticker-decal': {
      // Sticker with clear offset white border
      centralArtwork = `
      <g transform="scale(1.15)">
        <!-- Outer Sticker Die-cut Border -->
        <path d="M-220,-160 L220,-160 Q280,-160 280,-100 L280,120 Q280,180 220,180 L-220,180 Q-280,180 -280,120 L-280,-100 Q-280,-160 -220,-160 Z" 
              fill="#ffffff" stroke="${strokeColor}" stroke-width="12" />
        <path d="M-200,-140 L200,-140 Q250,-140 250,-90 L250,100 Q250,160 200,160 L-200,160 Q-250,160 -250,100 L-250,-90 Q-250,-140 -200,-140 Z" 
              fill="${isBlackAndWhite ? '#000000' : mainColor}" />
        <polygon points="0,-120 120,-20 80,100 -80,100 -120,-20" 
                 fill="${isBlackAndWhite ? '#ffffff' : accentColor}" 
                 stroke="${strokeColor}" stroke-width="6" />
        <circle cx="0" cy="0" r="40" fill="${isBlackAndWhite ? '#000000' : secondaryColor}" />
      </g>
      `;
      break;
    }

    case 'vintage-emblem': {
      // Circular / Badge Retro Seal
      centralArtwork = `
      <g transform="scale(1.1)">
        <!-- Outer Circular Seal -->
        <circle cx="0" cy="0" r="300" fill="${isBlackAndWhite ? '#000000' : secondaryColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
        <circle cx="0" cy="0" r="270" fill="#ffffff" stroke="${strokeColor}" stroke-width="6" stroke-dasharray="14,10" />
        <circle cx="0" cy="0" r="230" fill="${isBlackAndWhite ? '#ffffff' : mainColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
        <!-- Emblem Core -->
        <polygon points="0,-150 110,-50 140,80 0,170 -140,80 -110,-50" 
                 fill="${isBlackAndWhite ? '#000000' : accentColor}" 
                 stroke="${strokeColor}" stroke-width="${strokeWidth}" />
        <circle cx="0" cy="-10" r="40" fill="${isBlackAndWhite ? '#ffffff' : '#ffffff'}" />
      </g>
      `;
      break;
    }

    case 'stencil-silhouette': {
      // High-Contrast Cutout Silhouette
      centralArtwork = `
      <g transform="scale(1.2)">
        <polygon points="0,-190 -150,-40 -110,140 0,190 110,140 150,-40" fill="#000000" />
        <!-- Negative space bridges -->
        <rect x="-160" y="-10" width="320" height="18" fill="#ffffff" />
        <rect x="-10" y="-200" width="20" height="400" fill="#ffffff" />
        <circle cx="-55" cy="-70" r="22" fill="#ffffff" />
        <circle cx="55" cy="-70" r="22" fill="#ffffff" />
      </g>
      `;
      break;
    }

    default: {
      centralArtwork = `
      <g transform="scale(1.2)">
        <polygon points="0,-180 -140,-40 -100,140 0,200 100,140 140,-40" 
                 fill="${isBlackAndWhite ? '#000000' : mainColor}" 
                 stroke="${strokeColor}" 
                 stroke-width="${strokeWidth}" />
      </g>
      `;
    }
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" shape-rendering="geometricPrecision">
  <!-- Pure White Background for Clean Autotracing -->
  <rect width="1024" height="1024" fill="${bg}" />
  
  <g transform="translate(512, 480)">
    ${centralArtwork}
  </g>

  <!-- Clean Identifier Label -->
  <g transform="translate(512, 925)">
    <rect x="-380" y="-36" width="760" height="72" 
          fill="${isBlackAndWhite ? '#000000' : '#1c1917'}" 
          stroke="${strokeColor}" stroke-width="6" />
    <text x="0" y="10" 
          text-anchor="middle" 
          fill="#ffffff" 
          font-family="'IBM Plex Mono', 'Courier New', monospace" 
          font-size="20" 
          font-weight="bold" 
          letter-spacing="3">${cleanSubject} • ${stylePreset.toUpperCase()} (v${iteration})</text>
  </g>
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Converts an SVG Data URL to a downloadable PNG file via browser OffscreenCanvas
 */
export async function convertSvgToPngDataUrl(svgDataUrl: string, size = 1024): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Pure white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(svgDataUrl);
      }
    };
    img.onerror = () => resolve(svgDataUrl);
    img.src = svgDataUrl;
  });
}
