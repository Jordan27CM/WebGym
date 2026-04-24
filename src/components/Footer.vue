<template>
  <footer id="contacto" class="bg-slate-950 py-16">
    <div class="max-w-6xl mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div class="md:col-span-2">
          <div class="text-xl font-bold flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-lime-400"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
            IronForge
          </div>
          <p class="text-slate-400 text-sm max-w-sm">
            Entrenamiento, tecnología y comunidad para alcanzar tu mejor versión.
          </p>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Enlaces</h4>
          <ul class="flex flex-col gap-2 text-sm">
            <li><a href="#instalaciones" class="text-slate-400 hover:text-white transition-colors">Instalaciones</a></li>
            <li><a href="#planes" class="text-slate-400 hover:text-white transition-colors">Planes</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contacto</h4>
          <ul class="flex flex-col gap-2 text-sm text-slate-400">
            <li>Av. Principal 123, Ciudad</li>
            <li>+54 9 11 1234-5678</li>
            <li>contacto@ironforge.com</li>
          </ul>
        </div>
      </div>

      <div class="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>&copy; 2026 IronForge. Todos los derechos reservados.</p>
        <div class="flex gap-4">
          <a href="#" class="hover:text-slate-300 transition-colors">Términos</a>
          <a href="#" class="hover:text-slate-300 transition-colors">Privacidad</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>
