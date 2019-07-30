(function (win, doc) {

    var PullLoadMore = function (options) {

        this.el = options.el;

        var loadingCallback = options.onLoading;

        var loadingStatus = false;  // 是否正在加载
        var scrollTop = 0;  // 滑动距离
        var scrollHeight = 0; // 整体高度
        var loadAll = false; // 是否加载完所有数据
        var isInit = true;

        //this.el.onscroll = scrollListener.bind(this);

        this.el.addEventListener('scroll', scrollListener.bind(this));


        // 判断绑定的dom元素 是否为可滚动元素


        function scrollListener() {

            if (loadingStatus) return;

            scrollTop = this.el.scrollTop; // 滑动距离   

            var elHeight = this.el.clientHeight;
            var _scrollHeight = this.el.scrollHeight;  // 元素实际内容高度  

            // 判断是否滑动到底部了
            if (elHeight + scrollTop >= _scrollHeight) {

                if (scrollHeight >= _scrollHeight) {
                    // 未有变化, 无新数据
                    createLoadMoreDom(this.el);
                    loadingStatus = true;
                    this.loadAllDone();
                    return;
                }

                // 是否初始化
                isInit = scrollHeight == 0;

                //记录上一次内容高度 
                scrollHeight = _scrollHeight;

                // 创建加载更多的 dom 展示元素
                createLoadMoreDom(this.el);

                // 非初始化状态下执行
                if (isInit == false) {
                    loadingStatus = true;
                    loadingCallback();
                }

            }
        }

        // 创建加载更多的 DOM
        function createLoadMoreDom(el) {

            var dom = el.querySelector('.load-more-footer');
            if (dom) {
                return dom.style.display = 'flex';
            }

            var loadMoreFooter = document.createElement('div');
            loadMoreFooter.className = 'load-more-footer';

            var dom1 = document.createElement('div');
            dom1.className = 'load-more-loading';

            var dom2 = document.createElement('div');
            dom2.className = 'load-more-text';
            dom2.innerText = '加载更多...';

            loadMoreFooter.append(dom1);
            loadMoreFooter.append(dom2);

            el.appendChild(loadMoreFooter);
        }

        // 本次加载完毕
        // 注意事项： 该方法需要在DOM 更新后调用，否则 内容高度未变化会判断为所有数据加载完毕状态
        PullLoadMore.prototype.loadDone = function () {

            // 初始化状态与数据全部加载状态下，直接返回    
            if (loadAll || isInit) {
                return loadingStatus = false;
            }

            // 判断加载完成的之后的高度是否有变化，若无变化，说明无增量数据，即所有数据加载完毕
            if (scrollHeight >= this.el.scrollHeight) return this.loadAllDone();

            // 正常分页加载情况
            var footerHeight = this.el.querySelector('.load-more-footer');
            this.el.querySelector('.load-more-footer').style.display = 'none';
            this.el.scrollTo = scrollTop + footerHeight; // 重定位至加载更多的 dom 展示的位置
            loadingStatus = false;

        };

        // 所有数据都加载完
        PullLoadMore.prototype.loadAllDone = function () {
            this.el.querySelector('.load-more-loading').style.display = 'none';
            this.el.querySelector('.load-more-text').innerText = '没有更多数据啦';
            this.el.querySelector('.load-more-footer').style.display = 'flex';
            loadingStatus = false;
            loadAll = true;
        };

        // 重置
        PullLoadMore.prototype.reset = function () {
            var dom = this.el.querySelector('.load-more-footer');
            loadAll = false;
            loadingStatus = false;
            scrollHeight = 0;
            if (dom) this.el.removeChild(dom);
        };

    }

    win.PullLoadMore = PullLoadMore;

})(window, document);
