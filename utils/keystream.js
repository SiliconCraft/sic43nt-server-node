const R_Mask = [0x1d5363d5, 0x415a0aac, 0x0000d2a8]
const Comp0 = [0x6aa97a30, 0x7942a809, 0x00003fea]
const Comp1 = [0xdd629e9a, 0xe3a21d63, 0x00003dd7]
const S_Mask0 = [0x9ffa7faf, 0xaf4a9381, 0x00005802]
const S_Mask1 = [0x4c8cb877, 0x4911b063, 0x0000c52b]

const CLOCK_R = (ctx, input_bit, control_bit) => {
  /* Initialise the variables */
  const Feedback_bit = (u32sh_r(ctx.R[2], 15) & 1) ^ input_bit
  const Carry0 = u32sh_r(ctx.R[0], 31) & 1
  const Carry1 = u32sh_r(ctx.R[1], 31) & 1

  if (control_bit) {
    /* Shift and xor */
    ctx.R[0] ^= (ctx.R[0] << 1)
    ctx.R[1] ^= (ctx.R[1] << 1) ^ Carry0
    ctx.R[2] ^= (ctx.R[2] << 1) ^ Carry1
  } else {
    /* Shift only */
    ctx.R[0] = (ctx.R[0] << 1)
    ctx.R[1] = (ctx.R[1] << 1) ^ Carry0
    ctx.R[2] = (ctx.R[2] << 1) ^ Carry1
  }

  /* Implement feedback into the various register stages */
  if (Feedback_bit) {
    ctx.R[0] ^= R_Mask[0]
    ctx.R[1] ^= R_Mask[1]
    ctx.R[2] ^= R_Mask[2]
  }
}

const CLOCK_S = (ctx, input_bit, control_bit) => {
  /* Compute the feedback and two carry bits */
  const Feedback_bit = (u32sh_r(ctx.S[2], 15) & 1) ^ input_bit
  const Carry0 = u32sh_r(ctx.S[0], 31) & 1
  const Carry1 = u32sh_r(ctx.S[1], 31) & 1

  ctx.S[0] = (ctx.S[0] << 1) ^ ((ctx.S[0] ^ Comp0[0]) & (u32sh_r(ctx.S[0], 1) ^ (ctx.S[1] << 31) ^ Comp1[0]) & 0xfffffffe)
  ctx.S[1] = (ctx.S[1] << 1) ^ ((ctx.S[1] ^ Comp0[1]) & (u32sh_r(ctx.S[1], 1) ^ (ctx.S[2] << 31) ^ Comp1[1])) ^ Carry0
  ctx.S[2] = (ctx.S[2] << 1) ^ ((ctx.S[2] ^ Comp0[2]) & (u32sh_r(ctx.S[2], 1) ^ Comp1[2]) & 0x7fff) ^ Carry1

  /* Apply suitable feedback from s_79 */
  if (Feedback_bit) {
    if (control_bit) {
      ctx.S[0] ^= S_Mask1[0]
      ctx.S[1] ^= S_Mask1[1]
      ctx.S[2] ^= S_Mask1[2]
    } else {
      ctx.S[0] ^= S_Mask0[0]
      ctx.S[1] ^= S_Mask0[1]
      ctx.S[2] ^= S_Mask0[2]
    }
  }
}

const CLOCK_KG = (ctx, mixing, input_bit) => {
  const Keystream_bit = (ctx.R[0] ^ ctx.S[0]) & 1
  const control_bit_r = (u32sh_r(ctx.S[0], 27) ^ u32sh_r(ctx.R[1], 21)) & 1
  const control_bit_s = (u32sh_r(ctx.S[1], 21) ^ u32sh_r(ctx.R[0], 26)) & 1

  if (mixing) {
    CLOCK_R(ctx, (u32sh_r(ctx.S[1], 8) & 1) ^ input_bit, control_bit_r)
  } else {
    CLOCK_R(ctx, input_bit, control_bit_r)
  }

  CLOCK_S(ctx, input_bit, control_bit_s)

  return Keystream_bit
}

const setup = (ctx, key, iv) => {
  var i;
  const keysize = key.length
  const ivsize = iv.length

  iv = reverse(iv)
  key = reverse(key)
  /* Initialise R and S to all zeros */
  for (i = 0; i < 3; ++i) {
    ctx.R[i] = 0
    ctx.S[i] = 0
  }

  var iv_or_key_bit = undefined
  /* Load in IV */
  for (i = 0; i < ivsize; ++i) {
    /* Adopt usual, perverse, labelling order */
    iv_or_key_bit = parseInt(iv[i], 2) & 1
    CLOCK_KG(ctx, 1, iv_or_key_bit)
  }

  /* Load in K */
  for (i = 0; i < keysize; ++i) {
    /* Adopt usual, perverse, labelling order */
    iv_or_key_bit = parseInt(key[i], 2) & 1
    CLOCK_KG(ctx, 1, iv_or_key_bit)
  }

  /* Preclock */
  for (i = 0; i < 80; ++i) {
    CLOCK_KG(ctx, 1, 0)
  }
}

/* Length of keystream in bytes. */
export const keystream = (key, iv, length) => {
  var i
  var j
  var keystream = 0
  var resoure = ""
  var ctx = {
    R: [],
    S: []
  }
  setup(ctx, key, iv)

  for (i = 0; i < length; ++i) {
    keystream = 0

    for (j = 0; j < 8; ++j) {
      keystream ^= CLOCK_KG(ctx, 0, 0) << (7 - j)
    }
    // convert char to bit string
    var bytes = dechex(keystream)
    // 4 bit packed
    var binary = "00".substr(0, 2 - bytes.length).concat(bytes)
    resoure = resoure.concat(binary)
  }

  return resoure.toUpperCase()
}

export const hexbit = (hex_string) => {
  var binary = ""
  var end = hex_string.length
  for (var i = 0; i < end; ++i) {
    // convert char to bit string
    var bytes = decbin(hexdec(hex_string[i]))
    // 4 bit packed
    binary = binary.concat("00000000".substr(0, 4 - bytes.length), bytes)
  }
  return binary.toUpperCase()
}

const u32sh_r = (dec, shft) => {
  return (dec >> shft) & (2147483647 >> (shft - 1)) //Deleting unnecessary bits
}

// php function
const dechex = (dec) => {
  return parseInt(dec, 10).toString(16)
}

const decbin = (dec) => {
  return parseInt(dec, 10).toString(2)
}

const hexdec = (hex) => {
  return parseInt(hex, 16)
}

const reverse = (str) => {
  return str.split("").reverse().join("")
}
