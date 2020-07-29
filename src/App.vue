<template>
  <div>
    <input class='fn-block' type='file' id='file-selector' accept='image/*'>
    <ul>
      <li class="fn-flex flex-row">
        <label>图片加载时间：</label><span>{{loadTime}}</span><i>ms</i>
      </li>
      <li class="fn-flex flex-row">
        <label>识别时间：</label><span>{{detectionTime}}</span><i>ms</i>
      </li>
      <li class="fn-flex flex-row">
        <label>识别脸数量：</label><span>{{faceNum}}</span><i>个</i>
      </li>
      <li class="fn-flex flex-row">
        <label>图片大小：</label><span>{{imgSize}}</span><i>px</i>
      </li>
    </ul>
    <canvas class='fn-block' id='output'></canvas>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        loadTime: '0',
        detectionTime: '0',
        faceNum: '0',
        imgSize: '0x0',
      }
    },
    mounted() {
      let async = false; // webwork
      const _self = this;

      function getImageDim(image) {
        const result = {};
        document.body.appendChild(image);
        result['width'] = image.offsetWidth;
        result['height'] = image.offsetHeight;
        document.body.removeChild(image);
        return result;
      }

      function detectNewImage(src, async) {
        _self.loadTime = '计算中...';
        _self.detectionTime = '计算中...';
        _self.faceNum = '计算中...';
        _self.imgSize = '计算中...';
        let elapsed_time = new Date() * 1;
        const image = new Image();
        const canvas = document.getElementById('output');
        const ctx = canvas.getContext('2d');
        image.onload = function () {
          _self.loadTime = new Date() * 1 - elapsed_time
          const dim = getImageDim(image);
          _self.imgSize = dim.width + 'x' + dim.height;
          const boundingWidth = 400;
          let newWidth, newHeight, scale = 1;
          newWidth = boundingWidth;
          newHeight = boundingWidth * dim.height / dim.width;
          scale = newWidth / dim.width;
          canvas.width = newWidth;
          canvas.style.width = newWidth + 'px';
          canvas.height = newHeight;
          canvas.style.height = newHeight + 'px';
          ctx.drawImage(image, 0, 0, newWidth, newHeight);
          elapsed_time = new Date() * 1;

          function post(comp) {
            _self.faceNum = comp.length;
            _self.detectionTime = new Date() * 1 - elapsed_time;
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(230,87,0,0.8)';
            for (let i = 0; i < comp.length; i++) {
              ctx.beginPath();
              ctx.arc((comp[i].x + comp[i].width * 0.5) * scale, (comp[i].y + comp[i].height * 0.5) * scale,
                (comp[i].width + comp[i].height) * 0.25 * scale * 1.2, 0, Math.PI * 2);
              ctx.stroke();
            }
          }

          const comp = ccv.detect_objects({
            'canvas': ccv.grayscale(ccv.pre(image)),
            'cascade': cascade,
            'interval': 5,
            'min_neighbors': 1
          });
          post(comp);
        };
        image.src = src;
      }

      function handleLocalFile(file) {
        if (file.type.match(/image.*/)) {
          const reader = new FileReader();
          reader.onload = function (e) {
            detectNewImage(e.target.result, async);
          };
          reader.readAsDataURL(file);
        }
      }

      document.getElementById('file-selector').addEventListener('change', function (e) {
        const files = this.files;
        if (files.length)
          handleLocalFile(files[0]);
      });

      const url = window.location.hash.substr(1);
      if (url.length > 7) {
        document.getElementById('url-image').value = decodeURIComponent(url);
        document.getElementById('url-hint').style.visibility = 'hidden';
      }
    }
  }
</script>
<style lang="less">
  body {
    padding: 20px;
  }

  ul {
    margin: 20px 0;
    width: 400px;
    label {
      margin-right: 10px;
      width: 100px;
    }

    i {
      font-style: normal;
      margin-left: auto;
    }
  }
</style>
