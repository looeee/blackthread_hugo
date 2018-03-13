import 'whatwg-fetch';

import loadingManager from './loadingManager.js';
import load from './load.js';
import loaders from './Loaders.js';
import HTMLControl from '../HTMLControl.js';

import readFileAs from '../utilities/promiseFileReader.js';

// Check support for the File API support
const checkForFileAPI = () => {

  if ( !( window.File && window.FileReader && window.FileList && window.Blob ) ) {

    console.error( 'This loader requires the File API. Please upgrade your browser' );

  }

};

checkForFileAPI();

const isAsset = type => new RegExp( '(png|jpg|jpeg|gif|bmp|dds|tga|bin|vert|frag|txt|mtl)$' ).test( type );

const isModel = type => new RegExp( '(json|js|fbx|gltf|glb|dae|obj)$' ).test( type );

const isValid = type => isAsset( type ) || isModel( type );

let models = [];
let assets = {};
let promises = [];

const selectJSONLoader = ( file, originalFile ) => {
  const json = JSON.parse( file );

  if ( json.metadata ) {

    let type = '';
    if ( json.metadata.type ) type = json.metadata.type.toLowerCase();

    readFileAs( originalFile, 'DataURL' ).then( ( data ) => {

      if ( type === 'buffergeometry' ) load( loaders.bufferGeometryLoader( file ) );
      else if ( type === 'object' ) load( loaders.objectLoader( file ) );
      else load( loaders.jsonLoader( file ) );

    } ).catch( err => console.error( err ) );

  } else {

    console.error( 'Error: Invalid JSON file.' );

  }

};

const loadFile = ( details ) => {

  // console.log( details )

  const file = details[ 0 ];
  const type = details[ 1 ];
  const originalFile = details[ 2 ];

  switch ( type ) {

    case 'fbx':
      loadingManager.onStart();
      load( loaders.fbxLoader( file ) );
      break;
    case 'gltf':
    case 'glb':
      loadingManager.onStart();
      load( loaders.gltfLoader( file ) );
      break;
    case 'obj':
      loadingManager.onStart();
      loaders.mtlLoader( assets[originalFile.name.replace( '.obj', '.mtl' ) ] )
        .then( ( materials ) => {

          loaders.objLoader.setMaterials( materials );
          return load( loaders.objLoader( file ) );

        } ).catch( err => console.error( err ) );

      break;
    case 'dae':
      loadingManager.onStart();
      load( loaders.colladaLoader( file ) );
      break;
    case 'json':
    case 'js':
      loadingManager.onStart();
      selectJSONLoader( file, originalFile );
      break;
    default:
      console.error( 'Unsupported file type ' + type + ' - please load one of the supported model formats.' );
  }

};

loadingManager.setURLModifier( ( url ) => {

  if ( url[ url.length - 3 ] === '.' || url[ url.length - 4 ] === '.' ) {

    const type = url.split( '.' ).pop().toLowerCase();

    if ( isAsset( type ) ) {

      url = url.replace( 'data:application/', '' );
      url = url.split( '/' );
      url = url[ url.length - 1 ];

    }

  }

  if ( assets[ url ] === undefined ) return url;
  return assets[ url ];

} );

const processFile = ( file ) => {

  const type = file.name.split( '.' ).pop().toLowerCase();

  if ( !isValid( type ) ) return;

  if ( type === 'js' || type === 'json' ) {

    const promise = readFileAs( file, 'Text' )
      .then( ( data ) => { models.push( [ data, type, file ] ); } )
      .catch( err => console.error( err ) );

    promises.push( promise );

  } else {

    const promise = readFileAs( file, 'DataURL' )
      .then( ( data ) => {

        if ( isModel( type ) ) {

          if ( type === 'obj' ) models.push( [ data, type, file ] );
          else models.push( [ data, type ] );

        } else if ( isAsset( type ) ) {

          assets[ file.name ] = data;

        }

      } ).catch( err => console.error( err ) );

    promises.push( promise );

  }


};

const processFiles = ( files ) => {

  models = [];
  assets = {};
  promises = [];

  for ( let i = 0; i < files.length; i++ ) {

    processFile( files[ i ] );

  }

  Promise.all( promises )
    .then( () => {

      models.forEach( model => loadFile( model ) );

    } ).catch( err => console.error( err ) );

};

const form = HTMLControl.fileUpload.form;
const button = HTMLControl.fileUpload.button;

button.addEventListener( 'click', ( e ) => {

  e.preventDefault();
  HTMLControl.fileUpload.input.click();

}, false );

HTMLControl.fileUpload.input.addEventListener( 'change', ( e ) => {

  e.preventDefault();

  const files = e.target.files;

  processFiles( files );

}, false );

['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach( event => form.addEventListener( event, ( e ) => {

  e.preventDefault();
  e.stopPropagation();

} ) );

['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach( event => document.addEventListener( event, ( e ) => {

  e.preventDefault();
  e.stopPropagation();

} ) );

['dragover', 'dragenter'].forEach( event => form.addEventListener( event, () => {

  // form.classList.add( 'border' );
  button.style.background = '#B82601';

} ) );

['dragend', 'dragleave', 'drop'].forEach( event => form.addEventListener( event, () => {

  // form.classList.remove( 'border' );
  button.style.background = '#062f4f';

} ) );

HTMLControl.fileUpload.form.addEventListener( 'drop', ( e ) => {

  const files = e.dataTransfer.files;

  processFiles( files );

} );