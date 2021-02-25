<template>
  <div id="app">
    <header class="App-header">
      <router-view/>
    </header>
    <p>
      <a rel="noopener" target="_blank" href="https://github.com/vporton/donations">
        <img src="GitHub-Mark-32px.png" width="32" height="32" alt="Source at GitHub"/>
      </a>
    </p>

    <!-- Go to www.addthis.com/dashboard to customize your tools -->
    <!--script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-6036f81ff96859a4"></script-->
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    let addThisScript = document.createElement('script')
    addThisScript.setAttribute('src', '//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-6036f81ff96859a4')
    document.body.appendChild(addThisScript)
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.ethereumAddress {
  font-size: 72%;
}
</style>
