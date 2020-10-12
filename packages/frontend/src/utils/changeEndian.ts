export const changeEndian = (s: string): string => {
  let a = s.match(/../g) // split number in groups of two
  a.reverse() // reverse the groups
  let s2 = a.join('') // join the groups back together
  return s2
}
