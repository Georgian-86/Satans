/**
 * Interactive Grid Ripple Effect
 * Creates smooth ripple animations on grid hover
 */

class GridRipple {
    constructor(sectionSelector) {
        this.section = document.querySelector(sectionSelector);
        if (!this.section) return;

        this.canvas = null;
        this.ctx = null;
        this.ripples = [];
        this.gridSize = 40; // Match CSS grid size
        this.maxRippleRadius = 80; // How far ripple spreads
        this.rippleSpeed = 0.3; // Speed of expansion
        this.fadeSpeed = 0.015; // Fade out speed
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseOver = false;
        this.lastGridCell = null;

        this.init();
    }

    init() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'grid-ripple-canvas';
        this.ctx = this.canvas.getContext('2d');

        // Insert canvas as first child of hero section
        this.section.insertBefore(this.canvas, this.section.firstChild);

        // Set canvas size
        this.resize();

        // Event listeners
        window.addEventListener('resize', () => this.resize());
        this.section.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.section.addEventListener('mouseenter', () => this.isMouseOver = true);
        this.section.addEventListener('mouseleave', () => this.isMouseOver = false);

        // Start animation loop
        this.animate();
    }

    resize() {
        const rect = this.section.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    handleMouseMove(e) {
        const rect = this.section.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        // Calculate which grid cell mouse is over
        const gridX = Math.floor(this.mouseX / this.gridSize);
        const gridY = Math.floor(this.mouseY / this.gridSize);
        const currentCell = `${gridX},${gridY}`;

        // Only create ripple if we entered a new cell
        if (currentCell !== this.lastGridCell) {
            const centerX = gridX * this.gridSize + this.gridSize / 2;
            const centerY = gridY * this.gridSize + this.gridSize / 2;
            this.createRipple(centerX, centerY);
            this.lastGridCell = currentCell;
        }
    }

    createRipple(x, y) {
        this.ripples.push({
            x: x,
            y: y,
            radius: 0,
            opacity: 0.8,
            maxRadius: this.maxRippleRadius
        });
    }

    animate() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw ripples
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const ripple = this.ripples[i];

            // Expand ripple
            ripple.radius += this.rippleSpeed * (ripple.maxRadius - ripple.radius) * 0.1 + this.rippleSpeed;

            // Fade out
            ripple.opacity -= this.fadeSpeed;

            // Remove dead ripples
            if (ripple.opacity <= 0) {
                this.ripples.splice(i, 1);
                continue;
            }

            // Draw ripple effect
            this.drawRipple(ripple);
        }

        requestAnimationFrame(() => this.animate());
    }

    drawRipple(ripple) {
        const { x, y, radius, opacity } = ripple;

        // Create gradient for smooth ripple effect
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);

        // Center is more intense (red color matching theme)
        gradient.addColorStop(0, `rgba(232, 72, 85, ${opacity * 0.6})`);
        gradient.addColorStop(0.4, `rgba(232, 72, 85, ${opacity * 0.4})`);
        gradient.addColorStop(0.7, `rgba(232, 72, 85, ${opacity * 0.2})`);
        gradient.addColorStop(1, `rgba(232, 72, 85, 0)`);

        // Draw the gradient circle
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Also highlight grid lines in affected area
        this.highlightGridLines(x, y, radius, opacity);
    }

    highlightGridLines(x, y, radius, opacity) {
        // Calculate affected grid cells
        const cellsAffected = Math.ceil(radius / this.gridSize);
        const centerGridX = Math.floor(x / this.gridSize);
        const centerGridY = Math.floor(y / this.gridSize);

        this.ctx.strokeStyle = `rgba(232, 72, 85, ${opacity * 0.5})`;
        this.ctx.lineWidth = 2;

        // Draw highlighted grid lines
        for (let i = -cellsAffected; i <= cellsAffected; i++) {
            for (let j = -cellsAffected; j <= cellsAffected; j++) {
                const gridX = (centerGridX + i) * this.gridSize;
                const gridY = (centerGridY + j) * this.gridSize;

                // Calculate distance from ripple center
                const dist = Math.sqrt(Math.pow(gridX - x, 2) + Math.pow(gridY - y, 2));

                if (dist < radius) {
                    // Intensity based on distance
                    const intensity = 1 - (dist / radius);
                    this.ctx.strokeStyle = `rgba(232, 72, 85, ${opacity * intensity * 0.4})`;

                    // Draw vertical line
                    this.ctx.beginPath();
                    this.ctx.moveTo(gridX, gridY - this.gridSize / 2);
                    this.ctx.lineTo(gridX, gridY + this.gridSize / 2);
                    this.ctx.stroke();

                    // Draw horizontal line
                    this.ctx.beginPath();
                    this.ctx.moveTo(gridX - this.gridSize / 2, gridY);
                    this.ctx.lineTo(gridX + this.gridSize / 2, gridY);
                    this.ctx.stroke();
                }
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GridRipple('.hero');
});
