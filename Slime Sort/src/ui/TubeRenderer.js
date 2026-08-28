// src/ui/TubeRenderer.js

export class TubeRenderer {
    constructor(containerId, capacity) {
        this.container = document.getElementById(containerId);
        this.capacity = capacity;
        this.tubeElements = [];
    }

    init(tubesData, onTubeClick) {
        this.container.innerHTML = '';
        this.tubeElements = [];

        // Calculate dynamic heights based on capacity
        // Each block is 48px + 2px gap = 50px. Add 10px for top/bottom padding.
        const requiredTubeHeight = this.capacity * 50 + 10; 
        const requiredTubesContainerHeight = requiredTubeHeight + 50; // extra space for hover lift
        
        this.container.style.height = `${requiredTubesContainerHeight}px`;
        
        // Adjust game container to fit new height and width
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            const requiredWidth = Math.max(420, tubesData.length * 73 + 40); // 58px tube + 15px gap
            const requiredHeight = requiredTubesContainerHeight + 400;
            
            gameContainer.style.width = `${requiredWidth}px`;
            gameContainer.style.height = `${requiredHeight}px`;

            // Auto-scale to fit window
            const updateScale = () => {
                const scaleX = window.innerWidth / requiredWidth;
                const scaleY = window.innerHeight / requiredHeight;
                const scale = Math.min(1, scaleX * 0.95, scaleY * 0.95);
                gameContainer.style.transform = `scale(${scale})`;
                gameContainer.style.transformOrigin = 'center center';
            };
            
            updateScale();
            // Remove old listener if exists to avoid memory leak on restart
            if (this.resizeListener) window.removeEventListener('resize', this.resizeListener);
            this.resizeListener = updateScale;
            window.addEventListener('resize', this.resizeListener);
        }

        tubesData.forEach((tube, index) => {
            const el = document.createElement('div');
            el.className = 'tube';
            el.style.height = `${requiredTubeHeight}px`;
            el.dataset.index = index;
            
            el.addEventListener('click', (e) => {
                e.stopPropagation(); // Ngăn click lan ra ngoài
                onTubeClick(index);
            });

            this.container.appendChild(el);
            this.tubeElements.push(el);
            
            this.updateTube(index, tube);
        });
    }

    update(tubes, selectedTubeIndex) {
        tubes.forEach((tube, index) => {
            const tubeDiv = this.tubeElements[index];
            tubeDiv.innerHTML = ''; // clear

            if (index === selectedTubeIndex) {
                tubeDiv.classList.add('selected');
            } else {
                tubeDiv.classList.remove('selected');
            }

            // tube.clusters = [{color, size}]
            // Trình bày dưới dạng các block riêng biệt xếp chồng lên nhau
            tube.clusters.forEach(c => {
                for (let i = 0; i < c.size; i++) {
                    const block = document.createElement('div');
                    block.className = `slime-block color-${c.color}`;
                    
                    const hl = document.createElement('div');
                    hl.className = 'slime-hl';
                    block.appendChild(hl);
                    
                    tubeDiv.appendChild(block);
                }
            });
        });
    }

    updateTube(index, tubeData) {
        const el = this.tubeElements[index];
        el.innerHTML = ''; // Clear old slimes

        for (let i = 0; i < tubeData.length; i++) {
            const block = document.createElement('div');
            block.className = `slime-block color-${tubeData[i]}`;
            
            const hl = document.createElement('div');
            hl.className = 'slime-hl';
            block.appendChild(hl);
            
            el.appendChild(block);
        }
    }

    setSelected(index) {
        this.tubeElements.forEach((el, i) => {
            if (i === index) el.classList.add('selected');
            else el.classList.remove('selected');
        });
    }

    clearSelected() {
        this.tubeElements.forEach(el => el.classList.remove('selected'));
    }

    shake(index) {
        const el = this.tubeElements[index];
        if (!el) return;
        
        el.classList.add('invalid');
        setTimeout(() => {
            el.classList.remove('invalid');
        }, 300);
    }
}
