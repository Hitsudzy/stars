(function() {
    var app, fnAddEventListener, fnRequestAnimationFrame;
    fnRequestAnimationFrame = function(fnCallback) {
      var fnAnimFrame;
      fnAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(fnCallback) {
        window.setTimeOut(fnCallback, 1000 / 60);
      };
      fnAnimFrame(fnCallback);
    };

    fnAddEventListener = function(o, sEvent, fn) {
      if (o.addEventListener) {
        o.addEventListener(sEvent, fn, false);
      } else {
        o['on' + sEvent] = fn;
      }
    };

    app = function() {
      var Particle, ctxRender, fAngle, fCosAngle, fMaxAX, fMaxAY, fMaxAZ, fPI, fSinAngle, fStartVX, fStartVY, fStartVZ, fVX, fnACos, fnCos, fnMax, fnMin, fnNextFrame, fnRender, fnRnd, fnRnd2, fnSetSize, fnSin, fnSwapList, gui, h, iProjSphereX, iProjSphereY, iRadiusSphere, nBody, oBuffer, oDoc, oRadGrad, oRender, w;
      oDoc = document;
      nBody = oDoc.body;
      fPI = Math.PI;
      fnMax = Math.max;
      fnMin = Math.min;
      fnRnd = Math.random;
      fnRnd2 = function() {
        return 2.0 * fnRnd() - 1.0;
      };
      fnCos = Math.cos;
      fnACos = Math.acos;
      fnSin = Math.sin;
      iRadiusSphere = 150;
      iProjSphereX = 0;
      iProjSphereY = 0;
      fMaxAX = 0.1;
      fMaxAY = 0.1;
      fMaxAZ = 0.1;
      fStartVX = 0.001;
      fStartVY = 0.001;
      fStartVZ = 0.001;
      fAngle = 0.0;
      fSinAngle = 0.0;
      fCosAngle = 0.0;
      window.iFramesToRotate = 2000.0;
      window.iPerspective = 250;
      window.iNewParticlePerFrame = 10;
      window.fGrowDuration = 10.0;
      window.fWaitDuration = 10.0;
      window.fShrinkDuration = 10.0;
      window.aColor = [255, 255, 255];
      fVX = (2.0 * fPI) / window.iFramesToRotate;
      oRadGrad = null;
      ctxRender = nCanvasRender__mini.getContext('2d');
      oRender = {
        pFirst: null
      };
      oBuffer = {
        pFirst: null
      };
      w = h = 0;
      fnSetSize = function() {
        nCanvasRender__mini.width = w = window.innerWidth;
        nCanvasRender__mini.height = h = window.innerHeight;
        iProjSphereX = w / 2;
        iProjSphereY = h / 2;
        return {
          w: w,
          h: h
        };
      };
      fnSetSize();
      fnAddEventListener(window, 'resize', fnSetSize);
      fnSwapList = function(p, oSrc, oDst) {
        if (p != null) {
          if (oSrc.pFirst === p) {
            oSrc.pFirst = p.pNext;
            if (p.pNext != null) {
              p.pNext.pPrev = null;
            }
          } else {
            p.pPrev.pNext = p.pNext;
            if (p.pNext != null) {
              p.pNext.pPrev = p.pPrev;
            }
          }
        } else {
          p = new Particle();
        }
        p.pNext = oDst.pFirst;
        if (oDst.pFirst != null) {
          oDst.pFirst.pPrev = p;
        }
        oDst.pFirst = p;
        p.pPrev = null;
        return p;
      };
      Particle = (function() {
        function Particle() {}

        Particle.prototype.fX = 0.0;

        Particle.prototype.fY = 0.0;

        Particle.prototype.fZ = 0.0;

        Particle.prototype.fVX = 0.0;

        Particle.prototype.fVY = 0.0;

        Particle.prototype.fVZ = 0.0;

        Particle.prototype.fAX = 0.0;

        Particle.prototype.fAY = 0.0;

        Particle.prototype.fAZ = 0.0;

        Particle.prototype.fProjX = 0.0;

        Particle.prototype.fProjY = 0.0;

        Particle.prototype.fRotX = 0.0;

        Particle.prototype.fRotZ = 0.0;

        Particle.prototype.pPrev = null;

        Particle.prototype.pNext = null;

        Particle.prototype.fAngle = 0.0;

        Particle.prototype.fForce = 0.0;

        Particle.prototype.fGrowDuration = 0.0;

        Particle.prototype.fWaitDuration = 0.0;

        Particle.prototype.fShrinkDuration = 0.0;

        Particle.prototype.fRadiusCurrent = 0.0;

        Particle.prototype.iFramesAlive = 0;

        Particle.prototype.bIsDead = false;

        Particle.prototype.fnInit = function() {
          this.fAngle = fnRnd() * fPI * 2;
          this.fForce = fnACos(fnRnd2());
          this.fAlpha = 0;
          this.bIsDead = false;
          this.iFramesAlive = 0;
          this.fX = iRadiusSphere * fnSin(this.fForce) * fnCos(this.fAngle);
          this.fY = iRadiusSphere * fnSin(this.fForce) * fnSin(this.fAngle);
          this.fZ = iRadiusSphere * fnCos(this.fForce);
          this.fVX = fStartVX * this.fX;
          this.fVY = fStartVY * this.fY;
          this.fVZ = fStartVZ * this.fZ;
          this.fGrowDuration = window.fGrowDuration + fnRnd2() * (window.fGrowDuration / 4.0);
          this.fWaitDuration = window.fWaitDuration + fnRnd2() * (window.fWaitDuration / 4.0);
          this.fShrinkDuration = window.fShrinkDuration + fnRnd2() * (window.fShrinkDuration / 4.0);
          this.fAX = 0.0;
          this.fAY = 0.0;
          this.fAZ = 0.0;
        };

        Particle.prototype.fnUpdate = function() {
          if (this.iFramesAlive > this.fGrowDuration + this.fWaitDuration) {
            this.fVX += this.fAX + fMaxAX * fnRnd2();
            this.fVY += this.fAY + fMaxAY * fnRnd2();
            this.fVZ += this.fAZ + fMaxAZ * fnRnd2();
            this.fX += this.fVX;
            this.fY += this.fVY;
            this.fZ += this.fVZ;
          }
          this.fRotX = fCosAngle * this.fX + fSinAngle * this.fZ;
          this.fRotZ = -fSinAngle * this.fX + fCosAngle * this.fZ;
          this.fRadiusCurrent = Math.max(0.01, window.iPerspective / (window.iPerspective - this.fRotZ));
          this.fProjX = this.fRotX * this.fRadiusCurrent + iProjSphereX;
          this.fProjY = this.fY * this.fRadiusCurrent + iProjSphereY;
          this.iFramesAlive += 1;
          if (this.iFramesAlive < this.fGrowDuration) {
            this.fAlpha = this.iFramesAlive * 1.0 / this.fGrowDuration;
          } else if (this.iFramesAlive < this.fGrowDuration + this.fWaitDuration) {
            this.fAlpha = 1.0;
          } else if (this.iFramesAlive < this.fGrowDuration + this.fWaitDuration + this.fShrinkDuration) {
            this.fAlpha = (this.fGrowDuration + this.fWaitDuration + this.fShrinkDuration - this.iFramesAlive) * 1.0 / this.fShrinkDuration;
          } else {
            this.bIsDead = true;
          }
          if (this.bIsDead === true) {
            fnSwapList(this, oRender, oBuffer);
          }
          this.fAlpha *= fnMin(1.0, fnMax(0.5, this.fRotZ / iRadiusSphere));
          this.fAlpha = fnMin(1.0, fnMax(0.0, this.fAlpha));
        };

        return Particle;

      })();
      fnRender = function() {
        var iCount, p;
              ctxRender.clearRect(0, 0, w, h);
              p = oRender.pFirst;
              iCount = 0;
              while (p != null) {
                ctxRender.fillStyle = "rgba(" + window.aColor.join(',') + ',' + p.fAlpha.toFixed(4) + ")";
                ctxRender.beginPath();
                ctxRender.arc(p.fProjX, p.fProjY, p.fRadiusCurrent, 0, 2 * fPI, false);
                ctxRender.closePath();
                ctxRender.fill();
                p = p.pNext;
                iCount += 1;
              }
      };
      fnNextFrame = function() {
        var iAddParticle, iCount, p, pNext;
        fAngle = (fAngle + fVX) % (2.0 * fPI);
        fSinAngle = fnSin(fAngle);
        fCosAngle = fnCos(fAngle);
        iAddParticle = 0;
        iCount = 0;
        while (iAddParticle++ < window.iNewParticlePerFrame) {
          p = fnSwapList(oBuffer.pFirst, oBuffer, oRender);
          p.fnInit();
        }
        p = oRender.pFirst;
        while (p != null) {
          pNext = p.pNext;
          p.fnUpdate();
          p = pNext;
          iCount++;
        }
        fnRender();
        return fnRequestAnimationFrame(function() {
          return fnNextFrame();
        });
      };
      fnNextFrame();
      gui = new dat.GUI();
      gui.add(window, 'fGrowDuration').min(10).max(500).step(1);
      gui.add(window, 'fWaitDuration').min(10).max(500).step(1);
      gui.add(window, 'fShrinkDuration').min(10).max(500).step(1);
      gui.add(window, 'iPerspective').min(150).max(1000).step(1);
      gui.add(window, 'iNewParticlePerFrame').min(1).max(20).step(1);
      gui.add(window, 'iFramesToRotate').min(50).max(2500).step(50).onChange(function() {
        return fVX = (2.0 * fPI) / window.iFramesToRotate;
      });
      gui.addColor(window, 'aColor').onChange(function() {
        window.aColor[0] = ~~window.aColor[0];
        window.aColor[1] = ~~window.aColor[1];
        return window.aColor[2] = ~~window.aColor[2];
      });
      if (window.innerWidth < 100000) {
        gui.close();
        window.iNewParticlePerFrame = 5;
      }
      window.app = this;
    };

    fnAddEventListener(window, 'load', app);
}).call(this);