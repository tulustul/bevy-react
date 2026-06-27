/* tslint:disable */
/* eslint-disable */

/**
 * Format that each sample has. Usually, this corresponds to the sampling
 * depth of the audio source. For example, 16 bit quantized samples can be
 * encoded in `i16` or `u16`. Note that the quantized sampling depth is not
 * directly visible for formats where [`is_float`] is true.
 *
 * Also note that the backend must support the encoding of the quantized
 * samples in the given format, as there is no generic transformation from one
 * format into the other done inside the frontend-library code. You can query
 * the supported formats by using [`supported_input_configs`].
 *
 * A good rule of thumb is to use [`SampleFormat::I16`] as this covers typical
 * music (WAV, MP3) as well as typical audio input devices on most platforms,
 *
 * [`is_float`]: SampleFormat::is_float
 * [`supported_input_configs`]: crate::traits::DeviceTrait::supported_input_configs
 */
export enum SampleFormat {
    /**
     * `i8` with a valid range of `i8::MIN..=i8::MAX` with `0` being the origin.
     */
    I8 = 0,
    /**
     * `i16` with a valid range of `i16::MIN..=i16::MAX` with `0` being the origin.
     */
    I16 = 1,
    /**
     * `I24` with a valid range of `-(1 << 23)..=((1 << 23) - 1)` with `0` being the origin.
     *
     * This format uses 4 bytes of storage but only 24 bits are significant.
     */
    I24 = 2,
    /**
     * `i32` with a valid range of `i32::MIN..=i32::MAX` with `0` being the origin.
     */
    I32 = 3,
    /**
     * `i64` with a valid range of `i64::MIN..=i64::MAX` with `0` being the origin.
     */
    I64 = 4,
    /**
     * `u8` with a valid range of `u8::MIN..=u8::MAX` with `1 << 7 == 128` being the origin.
     */
    U8 = 5,
    /**
     * `u16` with a valid range of `u16::MIN..=u16::MAX` with `1 << 15 == 32768` being the origin.
     */
    U16 = 6,
    /**
     * `U24` with a valid range of `0..=((1 << 24) - 1)` with `1 << 23 == 8388608` being the origin.
     *
     * This format uses 4 bytes of storage but only 24 bits are significant.
     */
    U24 = 7,
    /**
     * `u32` with a valid range of `u32::MIN..=u32::MAX` with `1 << 31` being the origin.
     */
    U32 = 8,
    /**
     * `U48` with a valid range of '0..(1 << 48)' with `1 << 47` being the origin
     * `u64` with a valid range of `u64::MIN..=u64::MAX` with `1 << 63` being the origin.
     */
    U64 = 9,
    /**
     * `f32` with a valid range of `-1.0..=1.0` with `0.0` being the origin.
     */
    F32 = 10,
    /**
     * `f64` with a valid range of `-1.0..=1.0` with `0.0` being the origin.
     */
    F64 = 11,
    /**
     * DSD 1-bit stream in u8 container (8 bits = 8 DSD samples) with 0x69 being the silence byte pattern.
     */
    DsdU8 = 12,
    /**
     * DSD 1-bit stream in u16 container (16 bits = 16 DSD samples) with 0x69 being the silence byte pattern.
     */
    DsdU16 = 13,
    /**
     * DSD 1-bit stream in u32 container (32 bits = 32 DSD samples) with 0x69 being the silence byte pattern.
     */
    DsdU32 = 14,
}

/**
 * The set of parameters used to describe how to open a stream.
 *
 * The sample format is omitted in favour of using a sample type.
 *
 * See also [`BufferSize`] for details on buffer size behavior and latency considerations.
 */
export class StreamConfig {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    get buffer_size(): number | undefined;
    set buffer_size(value: number | null | undefined);
    channels: number;
    sample_rate: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly main: (a: number, b: number) => number;
    readonly __wbg_get_streamconfig_buffer_size: (a: number) => number;
    readonly __wbg_get_streamconfig_channels: (a: number) => number;
    readonly __wbg_get_streamconfig_sample_rate: (a: number) => number;
    readonly __wbg_set_streamconfig_buffer_size: (a: number, b: number) => void;
    readonly __wbg_set_streamconfig_channels: (a: number, b: number) => void;
    readonly __wbg_set_streamconfig_sample_rate: (a: number, b: number) => void;
    readonly __wbg_streamconfig_free: (a: number, b: number) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h05706098439cf7a2: (a: number, b: number, c: any, d: any, e: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h438f37dce69d128a: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h329d00f6bc5af1e3: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen__convert__closures_____invoke__h30f53c3256629fcf: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h7bbb8e1a1e7ec577: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h08c928d2359d0c00: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__hd9830cdb0df35191: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h0ba6167e1cd737e6: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h0ba6167e1cd737e6_7: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h0ba6167e1cd737e6_8: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h0ba6167e1cd737e6_9: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h0ba6167e1cd737e6_10: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h0ba6167e1cd737e6_11: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h0ba6167e1cd737e6_12: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h0ba6167e1cd737e6_13: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h2dc349ddd4f65d32: (a: number, b: number, c: number) => void;
    readonly wasm_bindgen__convert__closures_____invoke__hd0cd43bdc11596a9: (a: number, b: number) => any;
    readonly wasm_bindgen__convert__closures_____invoke__h79bc5c6cf436143b: (a: number, b: number) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h1f01538afc547f01: (a: number, b: number) => void;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_destroy_closure: (a: number, b: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
