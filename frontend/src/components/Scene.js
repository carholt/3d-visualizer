import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';

function Model({ url, time }) {
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const { camera } = useThree();

  const obj = useLoader(OBJLoader, url, 
    (loader) => {
      console.log('Model loading started for URL:', url);
    },
    (error) => {
      console.error('Error loading model:', error);
      setError(error);
    }
  );

  const ref = useRef();

  useEffect(() => {
    if (obj) {
      console.log('Model loaded successfully:', obj);
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0x808080 });
        }
      });

      // Center and scale the model
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

      obj.position.sub(center);
      camera.position.z = cameraZ * 2;
      camera.updateProjectionMatrix();

      setLoaded(true);
    }
  }, [obj, camera]);

  useFrame(() => {
    if (ref.current) {
      const angle = (time / 24) * Math.PI * 2;
      ref.current.rotation.y = angle;
    }
  });

  if (error) {
    console.error('Rendering error state:', error);
    return <mesh><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="red" /></mesh>;
  }

  if (!loaded) {
    console.log('Model not yet loaded');
    return null;
  }

  console.log('Rendering model');
  return <primitive object={obj} ref={ref} />;
}

function Scene({ modelUrl, time }) {
  console.log('Scene rendering with modelUrl:', modelUrl);

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <Model url={modelUrl} time={time} />
    </Canvas>
  );
}

export default Scene;
