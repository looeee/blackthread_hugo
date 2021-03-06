import HTMLControl from '../HTMLControl.js';
import backgroundVert from '../shaders/background.vert';
import backgroundFrag from '../shaders/background.frag';

export default class Background {

  constructor( app ) {

    this.app = app;

    this.initMaterials();
    this.initMesh();
    this.initButton();

    this.lightControls();

  }

  initMesh() {

    const geometry = new THREE.PlaneBufferGeometry( 2, 2, 1 );
    const mesh = new THREE.Mesh( geometry, this.mat );

    this.app.camera.add( mesh );


  }

  initMaterials() {

    const loader = new THREE.TextureLoader();
    const noiseTexture = loader.load( '/images/textures/noise-256.jpg' );
    noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;

    this.colA = new THREE.Color( 0xffffff );
    this.colB = new THREE.Color( 0x283844 );

    const uniforms = {
      color1: { value: this.colA },
      color2: { value: this.colB },
      noiseTexture: { value: noiseTexture },
      vignetteAmount: { value: 0 },
      mixAmount: { value: 0.08 },
    };

    this.mat = new THREE.RawShaderMaterial( {

      uniforms,
      // depthTest: false,
      // depthWrite: false,
      depthFunc: THREE.NeverDepth,
      vertexShader: backgroundVert,
      fragmentShader: backgroundFrag,

    } );

  }

  initButton() {

    let dark = false;

    HTMLControl.controls.toggleBackground.addEventListener( 'click', ( e ) => {

      e.preventDefault();
      if ( !dark ) {

        this.mat.uniforms.mixAmount.value = 0.8;
        this.mat.uniforms.vignetteAmount.value = -1.6;
        // this.colA.set( 0x283844 );
        // this.colB.set( 0xffffff );

        this.darkControls();

      } else {

        this.mat.uniforms.mixAmount.value = 0.08;
        this.mat.uniforms.vignetteAmount.value = 0;
        // this.colA.set( 0xffffff );
        // this.colB.set( 0x283844 );

        this.lightControls();

      }

      dark = !dark;

    }, false );
  }

  darkControls() {

    // HTMLControl.modelInfo.infoBox.style.color = 'white';

    HTMLControl.controls.main.classList.add( 'backgroundToggle' );

    for ( let i = 0; i < HTMLControl.controls.sliders.length; i++ ) {

      HTMLControl.controls.sliders[ i ].classList.remove( 'light-slider' );
      HTMLControl.controls.sliders[ i ].classList.add( 'dark-slider' );

    }
  }

  lightControls() {

    // HTMLControl.modelInfo.infoBox.style.color = 'black';

    HTMLControl.controls.main.classList.remove( 'backgroundToggle' );

    for ( let i = 0; i < HTMLControl.controls.sliders.length; i++ ) {

      HTMLControl.controls.sliders[ i ].classList.remove( 'dark-slider' );
      HTMLControl.controls.sliders[ i ].classList.add( 'light-slider' );

    }
  }

}

