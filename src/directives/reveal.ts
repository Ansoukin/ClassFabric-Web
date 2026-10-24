import type { Directive } from 'vue'

let io: IntersectionObserver | null = null

function observer(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io?.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
  }
  return io
}

/** v-reveal: fades and lifts an element in once it scrolls into view. */
export const reveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    el.classList.add('reveal')
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`
    const o = observer()
    if (o) o.observe(el)
    else el.classList.add('is-in')
  },
  unmounted(el) {
    io?.unobserve(el)
  },
}
