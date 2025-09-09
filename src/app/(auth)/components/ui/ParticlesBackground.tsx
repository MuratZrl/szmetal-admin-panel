'use client';

import { useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Container, ISourceOptions } from '@tsparticles/engine';

const ParticlesBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine); // daha hafif versiyon
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: {
        enable: true,
        zIndex: 0,
      },
      background: {
        color: {
          value: '#353535ff',
        },
        opacity: 0.05,
      },
      detectRetina: true,
      fpsLimit: 9999,
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
      
      particles: {
        
        number: {
          value: 1000,
          density: {
            enable: true,
            width: 1920,
            height: 1080,
          },
        },
        color: {
          value: '#ffffff',
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: 0.75,
        },
        size: {
          value: 3,
        },
        move: {
          enable: true,
          speed: 0.95,
          direction: 'top-left',
          random: true,
          straight: false,
          outModes: {
            default: 'out',
          },
        },
        wobble: {
          enable: true,
          distance: 50,
          speed: {
            angle: 75,
            move: 100,
          },
        },
        twinkle: {
          particles: {
            enable: true,
            frequency: 1,
            opacity: 1,
          },
        },
        shadow: {
          enable: true,
          color: {
            value: '#ffffff',
          },
          blur: 5,
          offset: {
            x: 0,
            y: 0,
          },
        },
        zIndex: {
          value: {
            min: 35,
            max: 150,
          },
        },
      },
    }),
    [],
  );

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      options={options}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default ParticlesBackground;
