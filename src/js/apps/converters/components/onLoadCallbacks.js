import readFileAs from '../utilities/promiseFileReader.js';

import loaderCanvas from '../main.js';
import Loaders from './Loaders.js';

const loaders = new Loaders();
const defaultMat = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x000000 } );

export default class OnLoadCallbacks {

  static onJSONLoad( file, originalFile ) {

    const json = JSON.parse( file );

    if ( json.metadata && json.metadata.type ) {

      const type = json.metadata.type.toLowerCase();

      readFileAs( originalFile, 'DataURL' ).then( ( data ) => {

        if ( type === 'buffergeometry' ) this.onJSONBufferGeometryLoad( data );
        else if ( type === 'geometry' ) this.onJSONGeometryLoad( data );
        else if ( type === 'object' ) this.onJSONObjectLoad( data );

      } ).catch( err => console.error( err ) );

    } else {

      console.error( 'Error: Invalid JSON file.' );

    }

  }

  static onJSONBufferGeometryLoad( file ) {

    console.log( 'Using THREE.BufferGeometryLoader' );

    const promise = loaders.bufferGeometryLoader( file );
    promise.then( ( geometry ) => {

      const object = new THREE.Mesh( geometry, defaultMat );
      loaderCanvas.addObjectToScene( object );

    } ).catch( ( err ) => {

      console.log( err );

    } );

    return promise;

  }

  static onJSONGeometryLoad( file ) {

    console.log( 'Using THREE.JSONLoader' );

    const promise = loaders.jsonLoader( file );
    promise.then( ( geometry ) => {

      const object = new THREE.Mesh( geometry, defaultMat );
      loaderCanvas.addObjectToScene( object );

    } ).catch( ( err ) => {

      console.log( err );

    } );

    return promise;

  }

  static onJSONObjectLoad( file ) {

    console.log( 'Using THREE.ObjectLoader' );

    const promise = loaders.objectLoader( file );
    promise.then( ( object ) => {

      loaderCanvas.addObjectToScene( object );

    } ).catch( ( err ) => {

      console.log( err );

    } );

    return promise;

  }

  static onFBXLoad( file ) {

    console.log( 'Using THREE.FBXLoader' );

    const promise = loaders.fbxLoader( file );

    promise.then( ( object ) => {

      loaderCanvas.addObjectToScene( object );

    } ).catch( ( err ) => {

      console.log( err );

    } );

    return promise;

  }

  static onGLTFLoad( file ) {

    let promise = new Promise( ( resolve, reject ) => {} );

    console.log( 'Using THREE.GLTFLoader' );

    promise = loaders.gltfLoader( file );

    promise.then( ( gltf ) => {

      if ( gltf.scenes.length > 1 ) {

        gltf.scenes.forEach( ( scene ) => {

          if ( gltf.animations ) scene.animations = gltf.animations;
          loaderCanvas.addObjectToScene( scene );

        } );

      } else if ( gltf.scene ) {

        if ( gltf.animations ) gltf.scene.animations = gltf.animations;
        loaderCanvas.addObjectToScene( gltf.scene );

      } else {

        console.error( 'No scene found in GLTF file.' );

      }

    } ).catch( ( err ) => {

      console.log( err );

    } );

    return promise;

  }

  static onMTLLoad( file ) {

    let promise = new Promise( ( resolve, reject ) => {} );

    promise = loaders.mtlLoader( file );

    return promise;
  }

  static onOBJLoad( file, materials ) {

    let promise = new Promise( ( resolve, reject ) => {} );

    loaders.objLoader.setMaterials( materials );

    promise = loaders.objLoader( file );

    promise.then( ( object ) => {

      loaderCanvas.addObjectToScene( object );

    } ).catch( ( err ) => {

      console.log( err );

    } );


    return promise;
  }

  static onDAELoad( file ) {

    let promise = new Promise( ( resolve ) => {} );

    // no need for this as ColladaLoader2 reports plenty of information
    // console.log( 'Using THREE.ColladaLoader2' );

    promise = loaders.colladaLoader( file );


    promise.then( ( object ) => {

      const scene = object.scene;

      if ( object.animations && object.animations.length > 0 ) scene.animations = object.animations;

      loaderCanvas.addObjectToScene( scene );


    } )
      .catch( ( err ) => {

        console.log( err );

      } );

    return promise;

  }

}
