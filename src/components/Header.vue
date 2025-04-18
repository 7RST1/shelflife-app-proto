<script setup lang="ts">

defineProps<{
  title: string;
  desc?: string;
}>()

</script>

<template>
  <div class="header-container">
    <div class="header">
      <h1><span style="font-weight: 300">shelf</span>LIFE</h1>
      <h1 class="page-title">{{title}}</h1>
      <p v-if="desc">{{desc}}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

body {
  background-color: #f2f2f2;
  color: #333;
}

.content {
  padding: 20px;
  margin-bottom: 60px;
}

.section {
  background-color: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #666;
}

/* Header container - this will stick to the top */
.header-container {
  position: sticky;
  top: 0;
  height: 150px;
  z-index: 100;
  padding: 0;
  margin: 0;
}

/* The actual header that will transform */
.header {
  background-color: #63a668;
  color: white;
  padding: 20px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  transition: height 0.3s, padding 0.3s;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h1.page-title {
    font-size: 32px;
    font-weight: 600;
    margin: 0 !important;
    transform-origin: bottom left;
    transition: transform 0.3s, font-size 0.3s;
  }

  p {
    font-size: 16px;
    opacity: 1;
    transition: opacity 0.3s;
  }
}

/* Header states based on scroll position */
.header-container.scrolled .header {
  height: 60px;
  padding: 10px 20px;
}

.header-container.scrolled .header h1 {
  font-size: 22px;
  transform: translateY(8px);
}

.header-container.scrolled .header p {
  opacity: 0;
}

/* This enables the scroll watcher */
@supports (animation-timeline: scroll()) {
  @keyframes shrink-header {
    0% {
      height: 150px;
      padding: 20px;
    }
    100% {
      height: 60px;
      padding: 10px 20px;
    }
  }

  @keyframes shrink-title {
    0% {
      font-size: 32px;
      transform: translateY(0);
    }
    100% {
      font-size: 22px;
      transform: translateY(8px);
    }
  }

  @keyframes fade-description {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .header {
    animation: shrink-header linear forwards;
    animation-timeline: scroll(nearest);
    animation-range: 0px 70px;

    h1 {
      animation: shrink-title linear forwards;
      animation-timeline: scroll(nearest);
      animation-range: 0px 70px;
    }

    p {
      animation: fade-description linear forwards;
      animation-timeline: scroll(nearest);
      animation-range: 0px 50px;
    }
  }

  /* We don't need these classes with animation-timeline */
  .header-container.scrolled .header,
  .header-container.scrolled .header h1,
  .header-container.scrolled .header p {
    animation: none;
  }
}
</style>