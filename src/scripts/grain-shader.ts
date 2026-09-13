/**
 * A narrow lazy-load entry point: importing the package namespace dynamically
 * retains every shader. Static re-exports let Vite remove unused effects while
 * GrainBackground still waits until idle time to download this chunk.
 */
export {
  ShaderMount,
  grainGradientFragmentShader,
  GrainGradientShapes,
  getShaderColorFromString,
  getShaderNoiseTexture,
} from "@paper-design/shaders";
