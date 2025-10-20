/** 
 * File: src/scripts/utilities/dashboard/dashboardUtility.js
 * Author: Yash Balotiya
 * Description: Utility functions for dashboard bubble reminder animations and interactions.
 * Created on: 18/10/2025
 * Last Modified: 20/10/2025
*/

// Floating Bubbles Functionality
const initFloatingBubbles = () => {
    const bubbles = document.querySelectorAll('.bubble');
    
    bubbles.forEach((bubble, index) => {
        // Start the floating animation directly without setting random positions
        // The animation will handle positioning smoothly from the start
        floatBubble(bubble, index);
    });
};

const floatBubble = (bubble, index) => {
    // Get bubble dimensions
    const bubbleWidth = bubble.offsetWidth;
    const bubbleHeight = bubble.offsetHeight;
    
    // Generate completely random parameters for each bubble
    const randomParams = {
        baseSpeedX: 0.0001 + Math.random() * 0.0003, // Random base speed
        baseSpeedY: 0.0001 + Math.random() * 0.0003,
        floatSpeedX: 0.0003 + Math.random() * 0.0005, // Random float speed
        floatSpeedY: 0.0003 + Math.random() * 0.0005,
        microSpeedX: 0.0008 + Math.random() * 0.0015, // Random micro speed
        microSpeedY: 0.0008 + Math.random() * 0.0015,
        rotationSpeed: 0.005 + Math.random() * 0.015, // Random rotation speed
        opacitySpeed: 0.0005 + Math.random() * 0.001, // Random opacity variation
        amplitudeX: 0.15 + Math.random() * 0.2, // Random movement range
        amplitudeY: 0.15 + Math.random() * 0.2,
        floatAmplitudeX: 15 + Math.random() * 15, // Random float amplitude
        floatAmplitudeY: 10 + Math.random() * 15,
        microAmplitudeX: 3 + Math.random() * 5, // Random micro amplitude
        microAmplitudeY: 2 + Math.random() * 6,
        phaseOffsetX: Math.random() * Math.PI * 2, // Random phase offsets
        phaseOffsetY: Math.random() * Math.PI * 2,
        floatOffsetX: Math.random() * Math.PI * 2,
        floatOffsetY: Math.random() * Math.PI * 2,
        microOffsetX: Math.random() * Math.PI * 2,
        microOffsetY: Math.random() * Math.PI * 2
    };
    
    // Calculate initial position based on animation parameters for smooth start
    const margin = 50;
    const maxX = window.innerWidth - margin - bubbleWidth;
    const maxY = window.innerHeight - margin - bubbleHeight;
    
    // Set initial position that matches the animation flow
    const initialX = (maxX / 2) + Math.sin(randomParams.phaseOffsetX) * (maxX * randomParams.amplitudeX);
    const initialY = (maxY / 2) + Math.cos(randomParams.phaseOffsetY) * (maxY * randomParams.amplitudeY);
    
    bubble.style.left = Math.max(margin, Math.min(maxX, initialX)) + 'px';
    bubble.style.top = Math.max(margin, Math.min(maxY, initialY)) + 'px';
    bubble.style.opacity = '0.7';
    
    const startTime = Date.now();

    const animate = () => {
        const elapsed = Date.now() - startTime;
        
        // Calculate completely random position using unique parameters for each bubble
        const baseX = (maxX / 2) + Math.sin(elapsed * randomParams.baseSpeedX + randomParams.phaseOffsetX) * (maxX * randomParams.amplitudeX);
        const baseY = (maxY / 2) + Math.cos(elapsed * randomParams.baseSpeedY + randomParams.phaseOffsetY) * (maxY * randomParams.amplitudeY);
        
        // Add random secondary floating movement
        const floatX = Math.sin(elapsed * randomParams.floatSpeedX + randomParams.floatOffsetX) * randomParams.floatAmplitudeX;
        const floatY = Math.cos(elapsed * randomParams.floatSpeedY + randomParams.floatOffsetY) * randomParams.floatAmplitudeY;
        
        // Add random micro-movements
        const microX = Math.sin(elapsed * randomParams.microSpeedX + randomParams.microOffsetX) * randomParams.microAmplitudeX;
        const microY = Math.cos(elapsed * randomParams.microSpeedY + randomParams.microOffsetY) * randomParams.microAmplitudeY;
        
        // Combine all movements
        const finalX = Math.max(margin, Math.min(maxX, baseX + floatX + microX));
        const finalY = Math.max(margin, Math.min(maxY, baseY + floatY + microY));
        
        // Random rotation with unique speed
        const rotation = (elapsed * randomParams.rotationSpeed) % 360;
        
        // Random opacity variation with unique parameters
        const opacityBase = 0.65 + Math.random() * 0.1; // Slightly random base opacity
        const opacityVariation = Math.sin(elapsed * randomParams.opacitySpeed + randomParams.phaseOffsetX) * 0.15;
        const opacity = Math.max(0.5, Math.min(0.9, opacityBase + opacityVariation));
        
        // Apply transformations
        bubble.style.left = finalX + 'px';
        bubble.style.top = finalY + 'px';
        bubble.style.transform = `rotate(${rotation}deg)`;
        bubble.style.opacity = opacity;
        
        requestAnimationFrame(animate);
    };
    
    // Start animation immediately for smooth initial movement
    animate();
};

// Export the initialization function
export { initFloatingBubbles };