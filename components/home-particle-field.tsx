"use client"

import { useEffect, useRef } from "react"

type ParticleFieldProps = {
  className?: string
}

const PARTICLE_COUNT = 14000
const VERTEX_SHADER = `
  attribute vec3 aPosition;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPointSize;
  uniform vec2 uResolution;
  varying vec3 vColor;
  varying float vDepth;

  void main() {
    vec3 position = aPosition;
    float waveA = sin(position.x * 2.8 + uTime * 0.62) * 0.16;
    float waveB = cos(position.y * 3.6 - uTime * 0.48) * 0.12;
    float waveC = sin((position.x + position.y) * 4.2 + uTime * 0.28) * 0.08;
    position.z += waveA + waveB + waveC;
    position.y += sin(position.x * 1.5 + uTime * 0.35) * 0.035;

    float cameraDepth = 3.6 - position.z;
    float perspective = 2.25 / cameraDepth;
    gl_Position = vec4(
      position.x * perspective * 3.1,
      position.y * perspective * 2.35,
      position.z / 4.0,
      1.0
    );
    gl_PointSize = uPointSize * perspective * (uResolution.y / 900.0);
    vColor = aColor;
    vDepth = 1.0 - smoothstep(-1.0, 1.0, position.z);
  }
`

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec3 vColor;
  varying float vDepth;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float distanceFromCenter = length(point);
    float glow = 1.0 - smoothstep(0.02, 0.5, distanceFromCenter);
    if (glow <= 0.01) discard;
    gl_FragColor = vec4(vColor, glow * (0.42 + vDepth * 0.38));
  }
`

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vertexShader || !fragmentShader) return null

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  return program
}

function createParticleData() {
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const colors = new Float32Array(PARTICLE_COUNT * 3)

  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    const column = index % 180
    const row = Math.floor(index / 180)
    const x = (column / 179) * 2 - 1
    const y = (row / 77) * 2 - 1
    const jitter = (Math.random() - 0.5) * 0.018
    const offset = index * 3

    positions[offset] = x + jitter
    positions[offset + 1] = y + (Math.random() - 0.5) * 0.018
    positions[offset + 2] = (Math.random() - 0.5) * 1.5

    const colorPosition = column / 179
    const red = Math.max(0, 1 - Math.abs(colorPosition - 0.2) * 3.4)
    const green = Math.max(0, 1 - Math.abs(colorPosition - 0.67) * 3.0)
    const blue = Math.max(0, 1 - Math.abs(colorPosition - 0.42) * 3.0)
    const purple = Math.max(0, 1 - Math.abs(colorPosition - 0.9) * 4.0)

    colors[offset] = red * 0.78 + purple * 0.32
    colors[offset + 1] = green * 0.75 + purple * 0.08
    colors[offset + 2] = blue * 0.92 + purple * 0.55
  }

  return { positions, colors }
}

export function HomeParticleField({ className = "" }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", { alpha: true, antialias: false })
    if (!gl) return

    const program = createProgram(gl)
    if (!program) return

    const { positions, colors } = createParticleData()
    const positionBuffer = gl.createBuffer()
    const colorBuffer = gl.createBuffer()
    if (!positionBuffer || !colorBuffer) return

    const positionLocation = gl.getAttribLocation(program, "aPosition")
    const colorLocation = gl.getAttribLocation(program, "aColor")
    const timeLocation = gl.getUniformLocation(program, "uTime")
    const pointSizeLocation = gl.getUniformLocation(program, "uPointSize")
    const resolutionLocation = gl.getUniformLocation(program, "uResolution")

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(colorLocation)
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    gl.clearColor(0, 0, 0, 0)

    let animationFrame = 0
    let startTime = performance.now()
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = canvas.clientWidth * dpr
      const height = canvas.clientHeight * dpr
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }

    const render = (now: number) => {
      resize()
      const elapsed = reduceMotion.matches ? 0 : (now - startTime) / 1000
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program)
      gl.uniform1f(timeLocation, elapsed)
      gl.uniform1f(pointSizeLocation, window.innerWidth < 640 ? 6.0 : 8.0)
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT)
      animationFrame = window.requestAnimationFrame(render)
    }

    const handleReducedMotionChange = () => {
      startTime = performance.now()
    }

    window.addEventListener("resize", resize)
    reduceMotion.addEventListener("change", handleReducedMotionChange)
    animationFrame = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", resize)
      reduceMotion.removeEventListener("change", handleReducedMotionChange)
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(colorBuffer)
      gl.deleteProgram(program)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-100 ${className}`}
    />
  )
}
