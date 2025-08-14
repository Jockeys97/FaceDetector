import React from "react";
import "./ImageLinkForm.css";

const ImageLinkForm = ({ onInputChange, onButtonSubmit, onFileChange, onLocalDetect, hasLocalFile, isLoading = false, disabledButton = false }) => {
    return (
        <div>
            <p className="f3 white">
                {'Questo Magic Brain rileverà le facce nelle tue immagini. Provaci!'}
            </p>
            <div className="center">
                <div className="form center pa4 br3 shadow-5">
                <input 
                    className="f4 pa2 w-70 center" 
                    type="text" 
                    onChange={onInputChange}
                    placeholder="Inserisci URL immagine..."
                    disabled={isLoading}
                />
                <button 
                    className={`w-30 grow f4 link ph3 pv2 dib white ${(isLoading || disabledButton) ? 'bg-gray' : 'bg-light-purple'}`}
                    onClick={onButtonSubmit}
                    disabled={isLoading || disabledButton}
                >
                    {isLoading ? 'Analizzando...' : 'Rileva'}
                </button>
            </div>
        </div>
        <div className="center" style={{ marginTop: '10px' }}>
            <div className="form center pa3 br3 shadow-5" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                    className="f5 pa2 w-70 center"
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    disabled={isLoading}
                />
                <button
                    className={`w-30 grow f5 link ph3 pv2 dib white ${(!hasLocalFile || isLoading) ? 'bg-gray' : 'bg-dark-green'}`}
                    onClick={onLocalDetect}
                    disabled={!hasLocalFile || isLoading}
                >
                    {isLoading ? 'Analizzando...' : 'Rileva da file'}
                </button>
            </div>
        </div>
        </div>
    );
};

export default ImageLinkForm;