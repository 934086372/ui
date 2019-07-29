/**
 * pull-refresh 下拉刷新插件 
 * @author 我是吊车尾
 * @email 934086372@qq.com 
 */

(function (window, document) {
    'use strict';

    // 定义下拉刷新方法    
    class PullRefresh {
        constructor(options) {
            this.el = options.el;
            this.loadingCallback = options.onLoading;

            this.initPosY = 0;
            this.options = {
                threshold: 60
            };
            this.pullDistance = 0;
            this.isLoading = false;

            this.doneStatus = false;

            this.setRefreshDone = function () {

                this.el.style.transform = 'translateY(0px)';
                this.el.style.transition = 'all 0.3s';

                document.querySelector('.pull-arrow-wrapper').style.display = 'block';
                document.querySelector('.pull-loading').style.display = 'none';

                this.isLoading = false;
            }

            this._init();
        }

        // 初始化操作
        _init() {

            var refreshHeader = document.createElement('div');
            refreshHeader.className = 'pull-refresh-header';

            var dom1 = document.createElement('div');
            dom1.className = 'pull-arrow-wrapper';
            var dom11 = document.createElement('div');
            dom11.className = 'pull-arrow';
            dom1.append(dom11);

            var dom2 = document.createElement('div');
            dom2.className = 'pull-loading';

            var dom3 = document.createElement('div');
            dom3.className = 'pull-text';
            dom3.innerText = '下拉加载更多';

            refreshHeader.append(dom1);
            refreshHeader.append(dom2);
            refreshHeader.append(dom3);

            this.el.insertBefore(refreshHeader, this.el.children[0]);

            this.refreshArrow = document.querySelector('.pull-arrow-wrapper');
            this.refreshLoadingDom = document.querySelector('.pull-loading');

            this.el.addEventListener('touchstart', this.touchStart.bind(this));
            this.el.addEventListener('touchmove', this.touchMove.bind(this));
            this.el.addEventListener('touchend', this.touchEnd.bind(this));

            this.el.addEventListener('scroll', this.scroll.bind(this));

            this.el.onscroll = function () {
                console.log(this.scrollHeight);
            }
        }

        touchStart(e) {
            this.initPosY = e.touches[0].pageY;
        }

        touchMove(e) {

            if (this.isLoading) return;
            var translateY = e.touches[0].pageY - this.initPosY;
            if (translateY > 0) {
                this.pullDistance = translateY;
                el.style.transform = 'translateY(' + translateY + 'px)';
                el.style.transition = 'all 0s';

                if (translateY > this.options.threshold) {
                    this.refreshArrow.style.transform = ' rotate(-180deg)';
                    this.refreshArrow.style.transition = 'all 0.5s';
                }
            } else {
                this.pullDistance = 0;
            }
        }

        touchEnd(e) {
            if (this.pullDistance < this.options.threshold) {
                this.el.style.transform = 'translateY(0px)';
                this.el.style.transition = 'all 0.5s';
                return;
            }
            if (this.isLoading) return;

            this.el.style.transform = 'translateY(' + this.options.threshold + 'px)';
            this.el.style.transition = 'all 0.5s';

            this.refreshArrow.style.transform = ' rotate(0deg)';
            this.refreshArrow.style.transition = 'all 0s';

            this.refreshArrow.style.display = 'none';
            this.refreshLoadingDom.style.display = 'block';

            this.isLoading = true;
            this.loadingCallback();
        }

        scroll(e) {
            console.log(e);
        };

    }

    window.PullRefresh = PullRefresh;

})(window, document);