# Guia de Otimização de Animações (Framer Motion)

Este documento descreve as práticas recomendadas para o uso do Framer Motion no projeto VendorCarro, focando em performance e fluidez.

## 🛑 O Que Evitar (Anti-Patterns)

1.  **Animar Listas Item por Item**:
    *   *Problema*: Causar múltiplos re-renders e layouts thrashing.
    *   *Evitar*:
        ```tsx
        // Ruim: Cada item com sua própria animação independente
        items.map(item => (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>...</motion.div>
        ))
        ```

2.  **Layout Animations em Scroll**:
    *   *Problema*: Propriedade `layout` é pesada pois calcula bounding boxes em tempo real.
    *   *Evitar*: Animar containers grandes durante scroll.

3.  **Animar Propriedades de Layout**:
    *   *Problema*: Animar `width`, `height`, `top`, `left`, `margin`, `padding` força o browser a recalcular o layout (reflow).
    *   *Evitar*: `animate={{ height: "auto" }}` (use apenas se essencial).

## ✅ Práticas Recomendadas

### 1. Animar o Container (Orchestration)
Use variantes para orquestrar a entrada de filhos. O container controla o fluxo, e os itens apenas herdam.

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Apenas 0.1s entre cada item
      delayChildren: 0.3,
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

return (
  <motion.div variants={container} initial="hidden" animate="show">
    {list.map(i => (
      <motion.div key={i} variants={item} />
    ))}
  </motion.div>
)
```

### 2. Use Transform e Opacity
Estas propriedades são animadas pela GPU (Composite Layer) e não causam reflow.

*   Use `x`, `y`, `rotate`, `scale`, `opacity`.
*   Para mover elementos, prefira `x/y` em vez de `left/top`.

### 3. Reduza a Duração
Animações de UI devem ser rápidas para não bloquear a interação.
*   **Entradas**: 0.2s a 0.4s.
*   **Saídas**: 0.1s a 0.2s.
*   **Micro-interações**: < 0.2s.

### 4. LayoutId para Elementos Compartilhados
Use `layoutId` para transições mágicas entre componentes (ex: mover um indicador de aba ativa ou expandir um card). O Framer Motion cuida da matemática pesada de forma otimizada.

```tsx
<motion.div layoutId="underline" className="absolute bottom-0..." />
```

### 5. AnimatePresence com Cautela
Use apenas para elementos que realmente saem da DOM (Modais, Toasts, Abas). Evite em listas longas virtuais.

---

## 🔍 Arquivos e Áreas de Foco

Atualmente, o uso de Framer Motion deve ser focado em:
1.  **Página de Login**: `src/app/(auth)/login/login-form.tsx` (Já otimizado com widgets individuais).
2.  **Lista de Veículos**: `src/app/(dashboard)/vehicles/page.tsx` (Deve usar padrão de container).
3.  **Transições de Rota**: `template.tsx` (se implementado).
