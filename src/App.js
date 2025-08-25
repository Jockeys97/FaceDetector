import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation';
import SignIn from './Components/Signin/SignIn';
import Register from './Components/Register/Register';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
// Rimosse integrazioni API/FaceRecognition

import './App.css';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import { detectFaces, detectFacesBase64, recognizeColors, recognizeColorsBase64 } from './services/apiService';
import { BACKEND_BASE_URL } from './config/api';

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      isLoading: false,
      boxes: [],
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      },
      facesData: [],
      colorData: [],
      localDataUrl: ''
    };
  }

  // componentDidMount() {
  //   fetch('http://localhost:3000/')
  //   .then(response => response.json())
  //   .then(data => console.log(data))
  //   .catch(error => console.error('Error:', error));
  // }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  };

  onButtonSubmit = async () => {
    const { input } = this.state;
    if (!input) return;
    this.setState({ isLoading: true, imageUrl: input, boxes: [], facesData: [], colorData: [] });
    try {
      const [{ regions }, { colors }] = await Promise.all([
        detectFaces(input),
        recognizeColors(input)
      ]);
      // Aggiorna sempre i colori
      this.setState({ colorData: colors });
      const img = document.getElementById('inputimage');
      if (img && regions.length > 0) {
        const width = img.width;
        const height = img.height;
        const boxes = regions.map(r => {
          const b = r.region_info.bounding_box;
          return {
            leftCol: b.left_col * width,
            topRow: b.top_row * height,
            rightCol: b.right_col * width,
            bottomRow: b.bottom_row * height
          };
        });
        const facesData = regions.map(r => r.data?.concepts?.[0]).filter(Boolean);
        this.setState({ boxes, facesData });
        await this.incrementEntries();
      } else {
        this.setState({ boxes: [], facesData: [] });
      }
    } catch (error) {
      console.error('Errore rilevamento facce:', error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  onFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      this.setState({ localDataUrl: dataUrl, imageUrl: dataUrl, boxes: [], facesData: [] });
    };
    reader.readAsDataURL(file);
  };

  incrementEntries = async () => {
    const { user } = this.state;
    if (!user || !user.id) return;
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/image`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id })
      });
      if (!response.ok) return;
      const data = await response.json().catch(() => null);

      let nextEntries = null;
      if (typeof data === 'number') {
        nextEntries = data;
      } else if (typeof data === 'string' && !isNaN(Number(data))) {
        nextEntries = Number(data);
      } else if (data && typeof data === 'object') {
        if (typeof data.entries === 'number') nextEntries = data.entries;
        else if (typeof data.entries === 'string' && !isNaN(Number(data.entries))) nextEntries = Number(data.entries);
        else if (Array.isArray(data) && data.length) {
          const first = data[0];
          if (typeof first === 'number') nextEntries = first;
          else if (first && (typeof first.entries === 'number' || (typeof first.entries === 'string' && !isNaN(Number(first.entries))))) {
            nextEntries = Number(first.entries);
          }
        }
      }

      if (typeof nextEntries === 'number' && !Number.isNaN(nextEntries)) {
        this.setState(prev => ({ user: { ...prev.user, entries: nextEntries } }));
      }
    } catch (error) {
      console.error('Errore aggiornamento entries:', error);
    }
  };

  onLocalDetect = async () => {
    const { localDataUrl } = this.state;
    if (!localDataUrl) return;
    const base64 = String(localDataUrl).split(',')[1];
    if (!base64) return;
    this.setState({ isLoading: true, boxes: [], facesData: [], colorData: [] });
    try {
      const [{ regions }, { colors }] = await Promise.all([
        detectFacesBase64(base64),
        recognizeColorsBase64(base64)
      ]);
      // Aggiorna sempre i colori
      this.setState({ colorData: colors });
      const img = document.getElementById('inputimage');
      if (img && regions.length > 0) {
        const width = img.width;
        const height = img.height;
        const boxes = regions.map(r => {
          const b = r.region_info.bounding_box;
          return {
            leftCol: b.left_col * width,
            topRow: b.top_row * height,
            rightCol: b.right_col * width,
            bottomRow: b.bottom_row * height
          };
        });
        const facesData = regions.map(r => r.data?.concepts?.[0]).filter(Boolean);
        this.setState({ boxes, facesData });
        await this.incrementEntries();
      } else {
        this.setState({ boxes: [], facesData: [] });
      }
    } catch (error) {
      console.error('Errore rilevamento facce (file locale):', error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  loadUser = (user) => {
    this.setState({
      user: {
        id: user?.id || '',
        name: user?.name || '',
        email: user?.email || '',
        entries: user?.entries ?? '',
        joined: user?.joined || ''
      }
    });
  };

  onRouteChange = (route) => {
    if (route === 'signin' || route === 'register') {
      this.setState({ isSignedIn: false });
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route });
  };


  render() {
    const { isLoading, localDataUrl } = this.state;

    return (
      <div className='App'>
        <div className='particles'>
          <span className='particle'></span>
          <span className='particle'></span>
          <span className='particle'></span>
          <span className='particle'></span>
          <span className='particle'></span>
          <span className='particle'></span>
          <span className='particle'></span>
          <span className='particle'></span>
          <span className='particle'></span>
          <span className='particle'></span>
          <span className='particle'></span>
          <span className='particle'></span>
        </div>
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn} />
        {this.state.route === 'signin' && (
          <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
        )}
        {this.state.route === 'register' && (
          <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
        )}
        {this.state.route === 'home' && (
          <>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm 
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
              onFileChange={this.onFileChange}
              onLocalDetect={this.onLocalDetect}
              hasLocalFile={!!localDataUrl}
              isLoading={isLoading}
            />
            <FaceRecognition boxes={this.state.boxes} imageUrl={this.state.imageUrl} faceData={this.state.facesData} colorData={this.state.colorData} />
          </>
        )}
      </div>
    );
  }
}

export default App;