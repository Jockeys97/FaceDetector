import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({ boxes = [], imageUrl, faceData, colorData, generalData, onImageLoad }) => {
  const hasResults = (Array.isArray(faceData) ? faceData.length > 0 : !!faceData) || colorData || generalData;

  return (
    <div className='center ma'>
      <div className='absolute mt2' style={{ position: 'relative', display: 'inline-block' }}>
        {imageUrl && (
          <img 
            id='inputimage' 
            alt='' 
            src={imageUrl} 
            width='500px' 
            height='auto'
            onLoad={onImageLoad}
          />
        )}
        {Array.isArray(boxes) && boxes.map((box, idx) => (
          <div key={idx} className='bounding-box' style={{
            top: box.topRow,
            left: box.leftCol,
            width: box.rightCol - box.leftCol,
            height: box.bottomRow - box.topRow
          }}></div>
        ))}
      </div>
      
      {/* Risultati analisi */}
      {hasResults && (
        <div className='analysis-results' style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          maxWidth: '600px',
          margin: '20px auto'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
            📊 Risultati Analisi
          </h3>
          
          {/* Face Detection Results */}
          {Array.isArray(faceData) && faceData.length > 0 && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
              <h4 style={{ color: '#007bff', marginBottom: '10px' }}>😊 Face Detection</h4>
              <p>✅ Facce rilevate: {boxes?.length || faceData.length}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {faceData.map((fd, i) => (
                  <span key={i} style={{
                    padding: '4px 8px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#495057'
                  }}>
                    Face {i + 1}: {Math.round(((fd?.value ?? 0) * 100))}%
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Color Recognition Results */}
          {colorData && colorData.length > 0 && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
              <h4 style={{ color: '#28a745', marginBottom: '10px' }}>🎨 Color Recognition</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {colorData.slice(0, 6).map((color, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '15px',
                    fontSize: '14px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: color.raw_hex,
                      borderRadius: '50%',
                      border: '2px solid #ddd'
                    }}></div>
                    <span>{color.w3c.name}</span>
                    <span style={{ color: '#666' }}>({Math.round(color.value * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* General Recognition Results */}
          {generalData && generalData.length > 0 && (
            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
              <h4 style={{ color: '#ffc107', marginBottom: '10px' }}>🔍 General Recognition</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {generalData.slice(0, 8).map((concept, index) => (
                  <span key={index} style={{
                    padding: '4px 8px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#495057'
                  }}>
                    {concept.name} ({Math.round(concept.value * 100)}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FaceRecognition;