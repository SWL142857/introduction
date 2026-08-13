(() => {
  'use strict'

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.documentElement.classList.add('js-ready')

  const addHeroIdentity = () => {
    const header = document.querySelector('#page-header.full_page')
    const title = header?.querySelector('#site-title')
    if (!header || !title) return

    title.innerHTML = [
      '<span class="hero-kicker">SWL / AI Systems Field Notes</span>',
      '<span>把知识连成图，</span>',
      '<span>把判断写成系统。</span>'
    ].join('')

    const canvas = document.createElement('canvas')
    canvas.className = 'swl-network'
    canvas.setAttribute('aria-hidden', 'true')
    header.prepend(canvas)
    drawKnowledgeField(canvas, header)
  }

  const drawKnowledgeField = (canvas, container) => {
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return

    let width = 0
    let height = 0
    let frame = 0
    let animationFrame = 0
    let nodes = []
    const pointer = { x: 0.72, y: 0.45, active: false }

    const seeded = index => {
      const x = Math.sin(index * 927.17 + 17.31) * 43758.5453
      return x - Math.floor(x)
    }

    const makeNodes = count => Array.from({ length: count }, (_, index) => ({
      x: seeded(index * 4 + 1) * width,
      y: seeded(index * 4 + 2) * height,
      vx: (seeded(index * 4 + 3) - 0.5) * 0.18,
      vy: (seeded(index * 4 + 4) - 0.5) * 0.18,
      radius: index % 9 === 0 ? 2.6 : index % 4 === 0 ? 1.8 : 1.1,
      accent: index % 11 === 0
    }))

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6)
      width = Math.max(rect.width, 1)
      height = Math.max(rect.height, 1)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      nodes = makeNodes(width < 720 ? 20 : 34)
      render()
    }

    const render = () => {
      context.clearRect(0, 0, width, height)
      const linkDistance = width < 720 ? 135 : 190

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i]

        if (!reducedMotion) {
          node.x += node.vx
          node.y += node.vy
          if (node.x < -20 || node.x > width + 20) node.vx *= -1
          if (node.y < -20 || node.y > height + 20) node.vy *= -1
        }

        for (let j = i + 1; j < nodes.length; j += 1) {
          const other = nodes[j]
          const dx = node.x - other.x
          const dy = node.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance > linkDistance) continue

          context.beginPath()
          context.moveTo(node.x, node.y)
          context.lineTo(other.x, other.y)
          context.strokeStyle = `rgba(196, 207, 197, ${(1 - distance / linkDistance) * 0.15})`
          context.lineWidth = 0.65
          context.stroke()
        }

        context.beginPath()
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        context.fillStyle = node.accent ? 'rgba(217, 255, 67, 0.8)' : 'rgba(196, 207, 197, 0.52)'
        context.fill()
      }

      if (pointer.active) {
        const px = pointer.x * width
        const py = pointer.y * height
        const gradient = context.createRadialGradient(px, py, 0, px, py, 150)
        gradient.addColorStop(0, 'rgba(145, 168, 255, 0.12)')
        gradient.addColorStop(1, 'rgba(145, 168, 255, 0)')
        context.fillStyle = gradient
        context.fillRect(px - 150, py - 150, 300, 300)
      }
    }

    const animate = () => {
      frame += 1
      if (!document.hidden && frame % 2 === 0) render()
      animationFrame = window.requestAnimationFrame(animate)
    }

    container.addEventListener('pointermove', event => {
      const rect = container.getBoundingClientRect()
      pointer.x = (event.clientX - rect.left) / rect.width
      pointer.y = (event.clientY - rect.top) / rect.height
      pointer.active = true
    }, { passive: true })

    container.addEventListener('pointerleave', () => {
      pointer.active = false
    }, { passive: true })

    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pagehide', () => window.cancelAnimationFrame(animationFrame), { once: true })
    resize()
    if (!reducedMotion) animate()
  }

  const numberArticles = () => {
    document.querySelectorAll('#recent-posts > .recent-post-items > .recent-post-item').forEach((item, index) => {
      item.dataset.index = String(index + 1).padStart(2, '0')
      item.classList.add('swl-reveal')
    })
  }

  const addTrackLight = () => {
    document.querySelectorAll('.swl-track').forEach(track => {
      track.addEventListener('pointermove', event => {
        const rect = track.getBoundingClientRect()
        track.style.setProperty('--mx', `${event.clientX - rect.left}px`)
        track.style.setProperty('--my', `${event.clientY - rect.top}px`)
      }, { passive: true })
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })

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
  addTrackLight()
  revealOnScroll()
  addReadingProgress()
})()
