import HTMLControl from '../HTMLControl.js';
import main from '../main.js';
import OnLoadCallbacks from './OnLoadCallbacks.js';

// saving function taken from three.js editor
const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594

const save = ( blob, filename ) => {

  link.href = URL.createObjectURL( blob );
  link.download = filename || 'data.json';
  link.click();

};

const saveString = ( text, filename ) => {

  save( new Blob( [ text ], { type: 'text/plain' } ), filename );

};

const saveArrayBuffer = ( buffer, filename ) => {

  save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

};

const stringByteLength = ( str ) => {
  // returns the byte length of an utf8 string
  let s = str.length;
  for ( let i = str.length - 1; i >= 0; i-- ) {
    const code = str.charCodeAt( i );
    if ( code > 0x7f && code <= 0x7ff ) s++;
    else if ( code > 0x7ff && code <= 0xffff ) s += 2;
    if ( code >= 0xDC00 && code <= 0xDFFF ) i--; // trail surrogate
  }

  return s;

}

class ExportGLTF {

  constructor() {

    this.loader = new THREE.GLTFLoader()
    this.exporter = new THREE.GLTFExporter();
    this.initExportButton();

  }

  getOptions() {

    return {
      trs: HTMLControl.controls.trs.checked,
      onlyVisible: HTMLControl.controls.onlyVisible.checked,
      truncateDrawRange: HTMLControl.controls.truncateDrawRange.checked,
      binary: HTMLControl.controls.binary.checked,
      forceIndices: HTMLControl.controls.forceIndices.checked,
      forcePowerOfTwoTextures: HTMLControl.controls.forcePowerOfTwoTextures.checked,
    };

  }

  setInput( input ) {

    this.input = input;
    this.parse();

  }

  parse() {

    this.exporter.parse( this.input, ( result ) => {

      this.result = result;
      this.processResult( result );

    }, this.getOptions() );

  }

  loadPreview() {

    main.resultPreview.reset();
    this.loader.parse( this.result, '', ( gltf ) => {

      HTMLControl.loading.result.overlay.classList.add( 'hide' );

      if ( gltf.scenes.length > 1 ) {

        gltf.scenes.forEach( ( scene ) => {

          if ( gltf.animations ) scene.animations = gltf.animations;
          main.resultPreview.addObjectToScene( scene );

        } );

      } else if ( gltf.scene ) {

        if ( gltf.animations ) gltf.scene.animations = gltf.animations;
        main.resultPreview.addObjectToScene( gltf.scene );

      }

    } );
  }

  processResult() {

    this.loadPreview();
    this.setOutput();

  }

  setSizeInfo( byteLength ) {

    if ( byteLength < 1000000 ) {

      HTMLControl.controls.exportGLTF.value = 'Export as GLTF (' + byteLength * 0.001 + 'kb)';

    } else {

      HTMLControl.controls.exportGLTF.value = 'Export as GLTF (' + byteLength * 1e-6 + 'mb)';

    }

  }

  setOutput() {

    if ( this.result instanceof ArrayBuffer ) {

      this.output = this.result;
      this.setSizeInfo( this.result.byteLength );

    } else {

      this.output = JSON.stringify( this.result, null, 2 );
      this.setSizeInfo( stringByteLength( this.output ) );

    }
  }

  save() {

    if ( this.output instanceof ArrayBuffer ) {

      saveArrayBuffer( this.result, 'scene.glb' );

    } else {

      saveString( this.output, 'scene.gltf' );

    }

  }

  initExportButton() {

    HTMLControl.controls.exportGLTF.addEventListener( 'click', ( e ) => {

      e.preventDefault();

      if ( this.output ) this.save( this.output );

    } );
  }

}

export default new ExportGLTF();