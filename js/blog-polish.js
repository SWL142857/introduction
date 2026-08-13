(() => {
  'use strict'

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.documentElement.classList.add('js-ready')

  const addHeroIdentity = () => {
    const header = document.querySelector('#page-header.full_page')
    const title = header?.querySelector('#site-title')
    if (!header || !title) return

    title.innerHTML = [
      '<span class="hero-kicker">SWL / A PERSONAL JOURNAL</span>',
      '<span>把日子写下来，</span>',
      '<span>也把成长留下来。</span>'
    ].join('')

    const marks = document.createElement('div')
    marks.className = 'swl-paper-marks'
    marks.setAttribute('aria-hidden', 'true')
    marks.innerHTML = [
      '<span class="swl-paper-mark swl-paper-mark--one"></span>',
      '<span class="swl-paper-mark swl-paper-mark--two"></span>',
      '<span class="swl-paper-mark swl-paper-mark--three"></span>'
    ].join('')
    header.prepend(marks)
  }

  const numberArticles = () => {
    document.querySelectorAll('#recent-posts > .recent-post-items > .recent-post-item').forEach((item, index) => {
      item.dataset.index = String(index + 1).padStart(2, '0')
      item.classList.add('swl-reveal')
    })
  }

  const revealOnScroll = () => {
    const elements = document.querySelectorAll('.swl-reveal')
    if (reducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach(element => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 })

    elements.forEach(element => observer.observe(element))
  }

  const addReadingProgress = () => {
    if (!document.querySelector('#post')) return
    const bar = document.createElement('div')
    bar.className = 'reading-progress'
    bar.setAttribute('aria-hidden', 'true')
    document.body.prepend(bar)

    let ticking = false
    const update = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight
      const progress = distance > 0 ? Math.min(window.scrollY / distance, 1) : 0
      bar.style.transform = `scaleX(${progress})`
      ticking = false
    }

    window.addEventListener('scroll', () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(update)
    }, { passive: true })
    update()
  }

  addHeroIdentity()
  numberArticles()
  revealOnScroll()
  addReadingProgress()
})()
