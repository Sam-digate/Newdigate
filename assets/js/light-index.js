var DIGATE_IN_ASSETS_HTML=/\/assets\/html\//i.test(window.location.pathname.replace(/\\/g,'/'));
var DIGATE_HOME_ROUTE=DIGATE_IN_ASSETS_HTML?'../../index.html':'index.html';
var DIGATE_INNER_PREFIX=DIGATE_IN_ASSETS_HTML?'':'assets/html/';
var DIGATE_ROUTES={
  'l-home':DIGATE_HOME_ROUTE,
  'l-platform':DIGATE_INNER_PREFIX+'platform.html','l-digate':DIGATE_INNER_PREFIX+'digate.html','l-xdigate':DIGATE_INNER_PREFIX+'xdigate.html',
  'l-solutions':DIGATE_INNER_PREFIX+'solutions.html','l-built-for':DIGATE_INNER_PREFIX+'built-for.html','l-resources':DIGATE_INNER_PREFIX+'resources.html',
  'l-blogs':DIGATE_INNER_PREFIX+'blogs.html','l-blog-detail':DIGATE_INNER_PREFIX+'blog-detail.html','l-use-cases':DIGATE_INNER_PREFIX+'use-cases.html',
  'l-use-case-detail':DIGATE_INNER_PREFIX+'use-case-detail.html','l-company':DIGATE_INNER_PREFIX+'company.html','l-demo':DIGATE_INNER_PREFIX+'demo.html'
};
function digateRoute(key){return DIGATE_ROUTES[key] || DIGATE_HOME_ROUTE;}

/* Resources is a family of pages; the FAQ is the first page to be published. */
(function(){
  var menus=[];
  document.querySelectorAll('.nav-links > a[data-go="l-resources"]').forEach(function(anchor,index){
    var wrapper=document.createElement('div');
    var trigger=document.createElement('button');
    var panel=document.createElement('div');
    var isCurrent=anchor.classList.contains('on');
    var currentPage=anchor.closest('.page');
    var currentResourcePage=currentPage && (currentPage.id==='pg-l-blogs' || currentPage.id==='pg-l-blog-detail') ? 'blogs' : (currentPage && (currentPage.id==='pg-l-use-cases' || currentPage.id==='pg-l-use-case-detail') ? 'cases' : (isCurrent ? 'faqs' : ''));
    var panelId='resources-menu-'+index;

    wrapper.className='resource-nav';
    trigger.className='resources-trigger'+(isCurrent?' is-current':'');
    trigger.type='button';
    trigger.setAttribute('aria-expanded','false');
    trigger.setAttribute('aria-controls',panelId);
    trigger.innerHTML='<span>Resources</span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';

    panel.className='resources-menu';
    panel.id=panelId;
    panel.setAttribute('aria-label','Resources');
    panel.innerHTML='<div class="resources-menu-grid">'+
        '<a href="'+digateRoute('l-blogs')+'" data-go="l-blogs"'+(currentResourcePage==='blogs'?' class="is-current"':'')+'><span class="resource-menu-icon blog"><i class="fa-regular fa-pen-to-square"></i></span><span class="resource-menu-copy"><strong>Blogs</strong><small>Ideas &amp; perspectives</small></span><i class="fa-solid fa-arrow-right resource-menu-arrow"></i></a>'+
        '<a href="'+digateRoute('l-use-cases')+'" data-go="l-use-cases"'+(currentResourcePage==='cases'?' class="is-current"':'')+'><span class="resource-menu-icon cases"><i class="fa-regular fa-lightbulb"></i></span><span class="resource-menu-copy"><strong>Use Cases</strong><small>Use-case examples</small></span><i class="fa-solid fa-arrow-right resource-menu-arrow"></i></a>'+
        '<button type="button" data-resource-pending><span class="resource-menu-icon reports"><i class="fa-regular fa-file-lines"></i></span><span class="resource-menu-copy"><strong>Reports</strong><small>Research &amp; insights</small></span><i class="fa-solid fa-arrow-right resource-menu-arrow"></i></button>'+
        '<a href="'+digateRoute('l-resources')+'" data-go="l-resources"'+(currentResourcePage==='faqs'?' class="is-current"':'')+'><span class="resource-menu-icon faqs"><i class="fa-regular fa-circle-question"></i></span><span class="resource-menu-copy"><strong>FAQs</strong><small>Quick answers</small></span><i class="fa-solid fa-arrow-right resource-menu-arrow"></i></a>'+
      '</div>';

    wrapper.appendChild(trigger);
    wrapper.appendChild(panel);
    anchor.replaceWith(wrapper);
    menus.push(wrapper);

    var closeTimer;
    function setMenuOpen(open){
      window.clearTimeout(closeTimer);
      var willOpen=!!open;
      menus.forEach(function(other){
        if(other===wrapper){return;}
        other.classList.remove('is-open');
        other.querySelector('.resources-trigger').setAttribute('aria-expanded','false');
      });
      wrapper.classList.toggle('is-open',willOpen);
      trigger.setAttribute('aria-expanded',willOpen?'true':'false');
    }

    trigger.addEventListener('click',function(event){
      event.stopPropagation();
      setMenuOpen(!wrapper.classList.contains('is-open'));
    });
    wrapper.addEventListener('mouseenter',function(){setMenuOpen(true);});
    wrapper.addEventListener('mouseleave',function(){closeTimer=window.setTimeout(function(){setMenuOpen(false);},120);});
    wrapper.addEventListener('focusin',function(){setMenuOpen(true);});
    wrapper.addEventListener('focusout',function(){
      closeTimer=window.setTimeout(function(){
        if(!wrapper.contains(document.activeElement)){setMenuOpen(false);}
      },0);
    });

    panel.querySelectorAll('[data-resource-pending]').forEach(function(item){
      item.setAttribute('aria-disabled','true');
      item.addEventListener('click',function(){
        setMenuOpen(false);
      });
    });
  });

  document.addEventListener('click',function(){
    menus.forEach(function(menu){
      menu.classList.remove('is-open');
      menu.querySelector('.resources-trigger').setAttribute('aria-expanded','false');
    });
  });

  document.addEventListener('keydown',function(event){
    if(event.key!=='Escape'){return;}
    menus.forEach(function(menu){
      menu.classList.remove('is-open');
      menu.querySelector('.resources-trigger').setAttribute('aria-expanded','false');
    });
  });
})();

/* Filter, search, and paginate the Blogs library. */
(function(){
  var page=document.getElementById('pg-l-blogs');
  if(!page){return;}
  var search=page.querySelector('[data-blog-search]');
  var filters=[].slice.call(page.querySelectorAll('[data-blog-filter]'));
  var cards=[].slice.call(page.querySelectorAll('.blog-card'));
  var featured=page.querySelector('[data-blog-featured]');
  var pagination=page.querySelector('[data-blog-pagination]');
  var empty=page.querySelector('[data-blog-empty]');
  var count=page.querySelector('[data-blog-count]');
  var listTop=page.querySelector('[data-blog-list-top]');
  var activeFilter='all';
  var currentPage=1;
  var pageSize=9;

  var detailPage=document.getElementById('pg-l-blog-detail');
  var detailTitle=detailPage && detailPage.querySelector('[data-blog-detail-title]');
  var detailCategory=detailPage && detailPage.querySelector('[data-blog-detail-category]');
  var detailDate=detailPage && detailPage.querySelector('[data-blog-detail-date]');
  var detailRead=detailPage && detailPage.querySelector('[data-blog-detail-read]');
  var detailImage=detailPage && detailPage.querySelector('[data-blog-detail-image]');
  var detailHeading=detailPage && detailPage.querySelector('[data-blog-detail-heading]');
  var detailSummary=detailPage && detailPage.querySelector('[data-blog-detail-summary]');
  var detailContext=detailPage && detailPage.querySelector('[data-blog-detail-context]');
  var detailCopy={
    commerce:{heading:'Making commerce operations more connected',context:'Commerce performance improves when teams can connect channel activity, customer demand, inventory, pricing, and financial outcomes. This article examines the operating choices behind the topic and how they support clearer, faster decisions.'},
    technology:{heading:'Connecting technology, context, and execution',context:'Technology creates practical value when it understands the business context around the data and supports the people responsible for execution. This article explores how teams can turn that connection into a more reliable operating rhythm.'},
    china:{heading:'Understanding the market behind the opportunity',context:'Success in China depends on understanding how local platforms, customer behavior, content, and commerce work together. This article looks at the market signals behind the topic and how international brands can respond with greater precision.'},
    growth:{heading:'Building growth on stronger customer signals',context:'Sustainable growth comes from understanding which audiences, content, channels, and experiences create real customer value. This article explores how teams can use those signals to sharpen priorities and improve execution.'}
  };

  function prepareArticle(item){
    var isFeatured=item===featured;
    var title=item.querySelector(isFeatured?'h2':'h3');
    var summary=item.querySelector(isFeatured?'.blog-featured-copy>p':'.blog-card-body>p');
    var category=item.querySelector('.blog-meta>span:first-child');
    var date=item.querySelector('.blog-meta time');
    var read=isFeatured?item.querySelector('.blog-meta>span:last-child'):item.querySelector('.blog-card-foot>span:first-child');
    var image=item.querySelector('img');
    var copy=detailCopy[item.dataset.category] || detailCopy.commerce;
    var articleData={title:title.textContent.trim(),category:category.textContent.trim(),date:date.textContent.trim(),dateTime:date.getAttribute('datetime') || '',read:read.textContent.trim(),image:image.getAttribute('src'),imageAlt:image.getAttribute('alt') || title.textContent.trim(),heading:copy.heading,summary:summary.textContent.trim(),context:copy.context};
    try{sessionStorage.setItem('digate-blog-detail',JSON.stringify(articleData));}catch(error){}
    if(detailPage){
      detailTitle.textContent=articleData.title;
      detailCategory.textContent=articleData.category;
      detailDate.textContent=articleData.date;
      detailDate.setAttribute('datetime',articleData.dateTime);
      detailRead.textContent=articleData.read;
      detailImage.setAttribute('src',articleData.image);
      detailImage.setAttribute('alt',articleData.imageAlt);
      detailHeading.textContent=articleData.heading;
      detailSummary.textContent=articleData.summary;
      detailContext.textContent=articleData.context;
    }
  }

  [featured].concat(cards).forEach(function(item){
    if(!item){return;}
    item.dataset.go='l-blog-detail';
    item.setAttribute('role','link');
    item.tabIndex=0;
    item.setAttribute('aria-label','Read article: '+item.querySelector(item===featured?'h2':'h3').textContent.trim());
    item.addEventListener('click',function(){prepareArticle(item);});
    item.addEventListener('keydown',function(event){if(event.key==='Enter' || event.key===' '){event.preventDefault();item.click();}});
  });

  function matches(item,query){
    var category=item.dataset.category || '';
    var haystack=((item.dataset.search || '')+' '+item.textContent).toLowerCase();
    return (activeFilter==='all' || category===activeFilter) && (!query || haystack.indexOf(query)>-1);
  }

  function makeButton(label,ariaLabel,disabled,active,onClick){
    var button=document.createElement('button');
    button.type='button';
    button.innerHTML=label;
    if(ariaLabel){button.setAttribute('aria-label',ariaLabel);}
    button.disabled=!!disabled;
    button.classList.toggle('is-active',!!active);
    if(active){button.setAttribute('aria-current','page');}
    button.addEventListener('click',onClick);
    return button;
  }

  function render(shouldScroll){
    var query=(search.value || '').trim().toLowerCase();
    var filtered=cards.filter(function(card){return matches(card,query);});
    var featuredMatch=featured && matches(featured,query);
    var totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));
    currentPage=Math.min(currentPage,totalPages);
    var start=(currentPage-1)*pageSize;
    var end=start+pageSize;

    cards.forEach(function(card,index){
      var filteredIndex=filtered.indexOf(card);
      card.hidden=filteredIndex<start || filteredIndex>=end;
    });
    if(featured){featured.hidden=!(currentPage===1 && featuredMatch);}
    if(count){count.textContent=filtered.length+(featuredMatch?1:0);}
    if(empty){empty.hidden=filtered.length>0 || featuredMatch;}

    pagination.innerHTML='';
    if(filtered.length>pageSize){
      pagination.appendChild(makeButton('<i class="fa-solid fa-arrow-left"></i>','Previous page',currentPage===1,false,function(){currentPage--;render(true);}));
      for(var i=1;i<=totalPages;i++){
        (function(pageNumber){pagination.appendChild(makeButton(String(pageNumber),'Page '+pageNumber,false,pageNumber===currentPage,function(){currentPage=pageNumber;render(true);}));})(i);
      }
      pagination.appendChild(makeButton('<i class="fa-solid fa-arrow-right"></i>','Next page',currentPage===totalPages,false,function(){currentPage++;render(true);}));
    }
    if(shouldScroll && listTop){listTop.scrollIntoView({behavior:'smooth',block:'start'});}
  }

  filters.forEach(function(button){
    button.addEventListener('click',function(){
      activeFilter=button.dataset.blogFilter;
      currentPage=1;
      filters.forEach(function(item){
        var active=item===button;
        item.classList.toggle('is-active',active);
        item.setAttribute('aria-pressed',active?'true':'false');
      });
      render(false);
    });
  });
  if(search){search.addEventListener('input',function(){currentPage=1;render(false);});}
  render(false);
})();

/* Restore the selected blog article after navigating to its standalone page. */
(function(){
  var detailPage=document.getElementById('pg-l-blog-detail');
  if(!detailPage){return;}
  var data;
  try{data=JSON.parse(sessionStorage.getItem('digate-blog-detail') || 'null');}catch(error){data=null;}
  if(!data){return;}
  var title=detailPage.querySelector('[data-blog-detail-title]');
  var category=detailPage.querySelector('[data-blog-detail-category]');
  var date=detailPage.querySelector('[data-blog-detail-date]');
  var read=detailPage.querySelector('[data-blog-detail-read]');
  var image=detailPage.querySelector('[data-blog-detail-image]');
  var heading=detailPage.querySelector('[data-blog-detail-heading]');
  var summary=detailPage.querySelector('[data-blog-detail-summary]');
  var context=detailPage.querySelector('[data-blog-detail-context]');
  if(title){title.textContent=data.title;}
  if(category){category.textContent=data.category;}
  if(date){date.textContent=data.date;date.setAttribute('datetime',data.dateTime || '');}
  if(read){read.textContent=data.read;}
  if(image){image.setAttribute('src',data.image);image.setAttribute('alt',data.imageAlt || data.title);}
  if(heading){heading.textContent=data.heading;}
  if(summary){summary.textContent=data.summary;}
  if(context){context.textContent=data.context;}
})();

/* Make the existing mobile menu buttons useful and keep Resources discoverable. */
(function(){
  document.querySelectorAll('header.nav').forEach(function(header,index){
    var menuButton=header.querySelector('.menu-btn');
    var nav=header.querySelector('.nav-links');
    if(!menuButton || !nav){return;}
    var panel=document.createElement('nav');
    var panelId='mobile-site-menu-'+index;
    panel.className='mobile-site-menu';
    panel.id=panelId;
    panel.setAttribute('aria-label','Mobile navigation');
    panel.setAttribute('aria-hidden','true');
    panel.innerHTML='<a href="'+digateRoute('l-home')+'" data-go="l-home">Home</a>'+
      '<a href="'+digateRoute('l-platform')+'" data-go="l-platform">Platform</a>'+
      '<a href="'+digateRoute('l-digate')+'" data-go="l-digate">Digate</a>'+
      '<a href="'+digateRoute('l-xdigate')+'" data-go="l-xdigate">X-Digate</a>'+
      '<a href="'+digateRoute('l-solutions')+'" data-go="l-solutions">Solutions</a>'+
      '<a href="'+digateRoute('l-built-for')+'" data-go="l-built-for">Built For</a>'+
      '<div class="mobile-resource-group"><span>Resources</span>'+
        '<a href="'+digateRoute('l-blogs')+'" data-go="l-blogs">Blogs</a>'+
        '<a href="'+digateRoute('l-use-cases')+'" data-go="l-use-cases">Use Cases</a>'+
        '<button type="button" aria-disabled="true">Reports</button>'+
        '<a href="'+digateRoute('l-resources')+'" data-go="l-resources">FAQs</a></div>'+
      '<a href="'+digateRoute('l-company')+'" data-go="l-company">Company</a>';
    header.appendChild(panel);
    menuButton.setAttribute('aria-expanded','false');
    menuButton.setAttribute('aria-controls',panelId);

    function closePanel(){
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden','true');
      menuButton.setAttribute('aria-expanded','false');
    }

    menuButton.addEventListener('click',function(event){
      event.stopPropagation();
      var open=!panel.classList.contains('is-open');
      document.querySelectorAll('.mobile-site-menu.is-open').forEach(function(other){
        other.classList.remove('is-open');
        other.setAttribute('aria-hidden','true');
      });
      panel.classList.toggle('is-open',open);
      panel.setAttribute('aria-hidden',open?'false':'true');
      menuButton.setAttribute('aria-expanded',open?'true':'false');
    });

    panel.querySelectorAll('[data-go]').forEach(function(link){link.addEventListener('click',closePanel);});
    document.addEventListener('click',function(event){if(!header.contains(event.target)){closePanel();}});
    document.addEventListener('keydown',function(event){if(event.key==='Escape'){closePanel();}});
  });
})();

/* progressive enhancement: make the site's own nav + footer links switch pages */
document.querySelectorAll('[data-go]').forEach(function(a){
  var targetRoute=digateRoute(a.dataset.go);
  if(a.dataset.caseDetail){targetRoute+='?case='+encodeURIComponent(a.dataset.caseDetail);}
  if(a.tagName==='A'){a.setAttribute('href',targetRoute);}
  a.addEventListener('click',function(e){
    var r=document.getElementById('r-'+a.dataset.go);
    if(r && !a.dataset.caseDetail){e.preventDefault();r.checked=true;window.scrollTo({top:0,behavior:'auto'});return;}
    if(a.tagName!=='A'){e.preventDefault();window.location.href=targetRoute;}
  });
});

/* FAQ filtering, search, and single-open accordion behavior. */
(function(){
  var page=document.getElementById('pg-l-resources');
  if(!page){return;}
  var items=[].slice.call(page.querySelectorAll('[data-faq-item]'));
  var filters=[].slice.call(page.querySelectorAll('[data-faq-filter]'));
  var search=page.querySelector('#faq-search-input');
  var count=page.querySelector('[data-faq-visible-count]');
  var empty=page.querySelector('[data-faq-empty]');
  var reset=page.querySelector('[data-faq-reset]');
  var activeFilter='all';

  function openItem(target){
    items.forEach(function(item){
      var open=item===target;
      var button=item.querySelector('.faq-question');
      var answer=item.querySelector('.faq-answer');
      item.classList.toggle('is-open',open);
      button.setAttribute('aria-expanded',open?'true':'false');
      answer.hidden=!open;
    });
  }

  function applyFilters(){
    var query=(search.value||'').trim().toLowerCase();
    var visible=[];
    items.forEach(function(item){
      var categoryMatches=activeFilter==='all' || item.dataset.faqCategory===activeFilter;
      var searchMatches=!query || item.textContent.toLowerCase().indexOf(query)!==-1;
      var show=categoryMatches && searchMatches;
      item.hidden=!show;
      if(show){visible.push(item);}
    });
    if(count){count.textContent=visible.length;}
    empty.hidden=visible.length!==0;
  }

  items.forEach(function(item){
    item.querySelector('.faq-question').addEventListener('click',function(){
      openItem(item.classList.contains('is-open')?null:item);
    });
  });

  filters.forEach(function(filter){
    filter.addEventListener('click',function(){
      activeFilter=filter.dataset.faqFilter;
      filters.forEach(function(other){
        var active=other===filter;
        other.classList.toggle('is-active',active);
        other.setAttribute('aria-pressed',active?'true':'false');
      });
      applyFilters();
    });
  });

  search.addEventListener('input',applyFilters);
  reset.addEventListener('click',function(){
    search.value='';
    activeFilter='all';
    filters.forEach(function(filter){
      var active=filter.dataset.faqFilter==='all';
      filter.classList.toggle('is-active',active);
      filter.setAttribute('aria-pressed',active?'true':'false');
    });
    openItem(items[0]);
    applyFilters();
    search.focus();
  });

  document.addEventListener('keydown',function(event){
    if((event.metaKey || event.ctrlKey) && event.key.toLowerCase()==='k'){
      var resourcesRadio=document.getElementById('r-l-resources');
      if(resourcesRadio && resourcesRadio.checked){
        event.preventDefault();
        search.focus();
      }
    }
  });
})();

document.querySelectorAll('[data-achieve-list]').forEach(function(list){
  list.querySelectorAll('.achieve-toggle').forEach(function(button){
    button.addEventListener('click',function(){
      var item=button.closest('[data-achieve-item]');
      var key=item && item.dataset.achieveItem;
      if(!key){return;}
      list.querySelectorAll('[data-achieve-item]').forEach(function(other){
        var active=other===item;
        other.classList.toggle('is-active',active);
        var otherButton=other.querySelector('.achieve-toggle');
        if(otherButton){otherButton.setAttribute('aria-expanded',active?'true':'false');}
      });
    });
  });
});

(function(){
  document.querySelectorAll('#pg-l-demo .faqs').forEach(function(list){
    var items=[].slice.call(list.querySelectorAll('.fq'));
    if(!items.length){return;}
    list.classList.add('is-enhanced');
    items.forEach(function(item,index){
      var active=index===0;
      item.classList.toggle('is-open',active);
      item.setAttribute('role','button');
      item.setAttribute('tabindex','0');
      item.setAttribute('aria-expanded',active?'true':'false');
      item.addEventListener('click',function(){
        items.forEach(function(other){
          var isCurrent=other===item;
          other.classList.toggle('is-open',isCurrent);
          other.setAttribute('aria-expanded',isCurrent?'true':'false');
        });
      });
      item.addEventListener('keydown',function(event){
        if(event.key==='Enter' || event.key===' '){
          event.preventDefault();
          item.click();
        }
      });
    });
  });
})();

(function(){
  function initStackedCards(selector,activeId){
    var cards=[].slice.call(document.querySelectorAll(selector));
    if(!cards.length){return;}
    function resetCards(){
      cards.forEach(function(card){
        card.style.setProperty('--exit-scale','1');
        card.style.setProperty('--exit-opacity','1');
        card.style.setProperty('--exit-blur','0px');
        card.style.setProperty('--exit-y','0px');
      });
    }
    function updateCardExit(){
      var active=document.getElementById(activeId);
      if(window.innerWidth<=980 || (active && !active.checked)){
        resetCards();
        return;
      }
      var stickyTop=112;
      var distanceRange=Math.max(420,window.innerHeight*.58);
      cards.forEach(function(card,index){
        var next=cards[index+1];
        if(!next){
          card.style.setProperty('--exit-scale','1');
          card.style.setProperty('--exit-opacity','1');
          card.style.setProperty('--exit-blur','0px');
          card.style.setProperty('--exit-y','0px');
          return;
        }
        var distanceToSticky=next.getBoundingClientRect().top-stickyTop;
        var progress=0;
        if(distanceToSticky<distanceRange && distanceToSticky>0){
          progress=1-(distanceToSticky/distanceRange);
        }else if(distanceToSticky<=0){
          progress=1;
        }
        var eased=1-Math.pow(1-progress,2.2);
        card.style.setProperty('--exit-y',(-18*eased).toFixed(2)+'px');
        card.style.setProperty('--exit-scale',(1-eased*.11).toFixed(4));
        card.style.setProperty('--exit-opacity',(1-eased*.88).toFixed(4));
        card.style.setProperty('--exit-blur',(eased*4).toFixed(2)+'px');
      });
    }
    var ticking=false;
    function requestExitUpdate(){
      if(ticking){return;}
      ticking=true;
      requestAnimationFrame(function(){
        ticking=false;
        updateCardExit();
      });
    }
    window.addEventListener('scroll',requestExitUpdate,{passive:true});
    window.addEventListener('resize',requestExitUpdate);
    document.querySelectorAll('input[name="nav"]').forEach(function(input){
      input.addEventListener('change',requestExitUpdate);
    });
    requestExitUpdate();
  }
  initStackedCards('#pg-l-solutions .sols .sol','r-l-solutions');
  initStackedCards('#pg-l-digate .digate-suite-stack .su','r-l-digate');
  initStackedCards('#pg-l-xdigate .xdigate-dept-stack-v2 .dept','r-l-xdigate');
})();

(function(){
  var showcase=document.querySelector('#pg-l-platform [data-platform-scroll-showcase]');
  if(!showcase){return;}
  var section=showcase.closest('.platform-approach-section');
  var reduceMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(value,min,max){
    return Math.max(min,Math.min(max,value));
  }
  function applyShowcase(progress){
    var initialWidth=Math.min(1200,Math.max(320,window.innerWidth*.92));
    var image=showcase.querySelector('img');
    var imageWidth=image && image.naturalWidth ? image.naturalWidth : window.innerWidth;
    var imageHeight=image && image.naturalHeight ? image.naturalHeight : 0;
    var finalWidth=Math.min(window.innerWidth*.8,imageWidth);
    var initialHeight=clamp(window.innerWidth*.24,window.innerWidth<=720?180:240,window.innerWidth<=720?260:320);
    var finalImageHeight=imageWidth && imageHeight ? finalWidth*(imageHeight/imageWidth) : window.innerHeight-88;
    var finalHeight=Math.max(initialHeight,Math.min(window.innerHeight-88,finalImageHeight));
    var eased=1-Math.pow(1-progress,2.15);
    var width=initialWidth+(finalWidth-initialWidth)*eased;
    var height=initialHeight+(finalHeight-initialHeight)*eased;
    showcase.style.setProperty('--platform-frame-width',width.toFixed(2)+'px');
    showcase.style.setProperty('--platform-frame-height',height.toFixed(2)+'px');
  }
  if(reduceMotion){
    applyShowcase(1);
    return;
  }
  function updateShowcase(){
    var active=document.getElementById('r-l-platform');
    if(active && !active.checked){
      applyShowcase(0);
      return;
    }
    var rect=showcase.getBoundingClientRect();
    var travel=Math.max(180,Math.min(320,window.innerHeight*.38));
    var start=window.innerHeight*.72;
    var progress=clamp((start-rect.top)/travel,0,1);
    applyShowcase(progress);
  }
  var ticking=false;
  function requestShowcaseUpdate(){
    if(ticking){return;}
    ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      updateShowcase();
    });
  }
  window.addEventListener('scroll',requestShowcaseUpdate,{passive:true});
  window.addEventListener('resize',requestShowcaseUpdate);
  var showcaseImage=showcase.querySelector('img');
  if(showcaseImage){
    showcaseImage.addEventListener('load',requestShowcaseUpdate);
  }
  document.querySelectorAll('input[name="nav"]').forEach(function(input){
    input.addEventListener('change',requestShowcaseUpdate);
  });
  requestShowcaseUpdate();
})();

(function(){
  var studio=document.querySelector('#pg-l-xdigate .content-studio-visual');
  if(!studio){return;}
  var userText=studio.querySelector('.chat-row.user p');
  var agentText=studio.querySelector('.chat-row.agent p');
  var agentRow=studio.querySelector('.chat-row.agent');
  var articles=[].slice.call(studio.querySelectorAll('.generated-content article'));
  if(!userText || !agentText || !articles.length){return;}

  var reduceMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var userMessage=userText.textContent.trim();
  var agentMessage=agentText.textContent.trim();
  var thinking=[
    'Reading brand knowledge...',
    'Matching audience segments...',
    'Adapting channel tone...',
    'Generating platform drafts...'
  ];
  var timers=[];

  function clearTimers(){
    timers.forEach(function(timer){clearTimeout(timer);});
    timers=[];
  }
  function later(fn,delay){
    var timer=setTimeout(fn,delay);
    timers.push(timer);
  }
  function typeInto(node,text,speed,done){
    node.textContent='';
    node.classList.add('is-typing');
    var index=0;
    function tick(){
      node.textContent=text.slice(0,index);
      index+=1;
      if(index<=text.length){
        later(tick,speed);
      }else{
        node.classList.remove('is-typing');
        if(done){done();}
      }
    }
    tick();
  }
  function reset(){
    clearTimers();
    studio.classList.add('is-animated');
    userText.textContent='';
    agentText.textContent='';
    userText.classList.remove('is-typing');
    agentText.classList.remove('is-typing','is-thinking');
    if(agentRow){agentRow.classList.remove('is-visible');}
    articles.forEach(function(article){article.classList.remove('is-visible');});
  }
  function play(){
    reset();
    if(reduceMotion){
      userText.textContent=userMessage;
      agentText.textContent=agentMessage;
      if(agentRow){agentRow.classList.add('is-visible');}
      articles.forEach(function(article){article.classList.add('is-visible');});
      return;
    }
    later(function(){
      typeInto(userText,userMessage,22,function(){
        later(function(){
          if(agentRow){agentRow.classList.add('is-visible');}
          agentText.classList.add('is-thinking');
          var step=0;
          function showStep(){
            agentText.textContent=thinking[step];
            step+=1;
            if(step<thinking.length){
              later(showStep,620);
            }else{
              later(function(){
                agentText.classList.remove('is-thinking');
                typeInto(agentText,agentMessage,14,function(){
                  articles.forEach(function(article,index){
                    later(function(){article.classList.add('is-visible');},index*220);
                  });
                  later(play,4200);
                });
              },520);
            }
          }
          showStep();
        },420);
      });
    },500);
  }
  play();
})();

(function(){
  var consoleEl=document.querySelector('#pg-l-xdigate .automation-console-visual');
  if(!consoleEl){return;}
  var requestText=consoleEl.querySelector('.run-request p');
  var steps={
    product:consoleEl.querySelector('.step-product'),
    validate:consoleEl.querySelector('.step-validate'),
    submit:consoleEl.querySelector('.step-submit')
  };
  var resultText=steps.submit && steps.submit.querySelector('p');
  var actions=consoleEl.querySelector('.approval-actions');
  var approve=actions && actions.querySelector('button:last-child');
  var runBadge=consoleEl.querySelector('.run-title em');
  if(!requestText || !steps.product || !steps.validate || !steps.submit || !resultText || !actions){return;}

  var reduceMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var requestMessage=requestText.textContent.trim();
  var resultMessage=resultText.textContent.trim();
  var timers=[];

  function clearTimers(){
    timers.forEach(function(timer){clearTimeout(timer);});
    timers=[];
  }
  function later(fn,delay){
    var timer=setTimeout(fn,delay);
    timers.push(timer);
  }
  function typeInto(node,text,speed,done){
    node.textContent='';
    node.classList.add('is-typing');
    var index=0;
    function tick(){
      node.textContent=text.slice(0,index);
      index+=1;
      if(index<=text.length){
        later(tick,speed);
      }else{
        node.classList.remove('is-typing');
        if(done){done();}
      }
    }
    tick();
  }
  function setStep(step,state,label){
    step.classList.remove('is-hidden','is-visible','is-pending','is-running','is-confirmed','is-waiting','is-approved');
    step.classList.add('is-visible');
    step.classList.add('is-'+state);
    var badge=step.querySelector('em');
    if(badge){badge.textContent=label;}
  }
  function hideStep(step){
    step.classList.remove('is-visible','is-pending','is-running','is-confirmed','is-waiting','is-approved');
    step.classList.add('is-hidden');
    var badge=step.querySelector('em');
    if(badge){badge.textContent='';}
  }
  function reset(){
    clearTimers();
    consoleEl.classList.add('is-animated');
    requestText.textContent='';
    requestText.classList.remove('is-typing');
    resultText.textContent='';
    resultText.classList.remove('is-visible','is-typing');
    actions.classList.remove('is-visible');
    if(approve){approve.classList.remove('is-clicked');}
    if(runBadge){runBadge.textContent='0 / 8';}
    hideStep(steps.product);
    hideStep(steps.validate);
    hideStep(steps.submit);
  }
  function play(){
    reset();
    if(reduceMotion){
      requestText.textContent=requestMessage;
      resultText.textContent=resultMessage;
      resultText.classList.add('is-visible');
      actions.classList.add('is-visible');
      setStep(steps.product,'confirmed','Confirmed');
      setStep(steps.validate,'confirmed','Confirmed');
      setStep(steps.submit,'waiting','Needs approval');
      if(runBadge){runBadge.textContent='8 / 8';}
      return;
    }
    later(function(){
      typeInto(requestText,requestMessage,18,function(){
        later(function(){
          setStep(steps.product,'running','Running');
          if(runBadge){runBadge.textContent='2 / 8';}
          later(function(){
            setStep(steps.product,'confirmed','Confirmed');
            setStep(steps.validate,'running','Running');
            if(runBadge){runBadge.textContent='5 / 8';}
            later(function(){
              setStep(steps.validate,'confirmed','Confirmed');
              setStep(steps.submit,'running','Submitting');
              if(runBadge){runBadge.textContent='7 / 8';}
              later(function(){
                setStep(steps.submit,'waiting','Needs approval');
                if(runBadge){runBadge.textContent='8 / 8';}
                resultText.classList.add('is-visible');
                typeInto(resultText,resultMessage,12,function(){
                  actions.classList.add('is-visible');
                  later(function(){
                    if(approve){approve.classList.add('is-clicked');}
                    setStep(steps.submit,'approved','Approved');
                    later(play,3000);
                  },1200);
                });
              },800);
            },760);
          },720);
        },420);
      });
    },500);
  }
  play();
})();

/* Reveal Use Cases cards as they enter the viewport. */
(function(){
  var page=document.getElementById('pg-l-use-cases');
  if(!page){return;}
  var cards=[].slice.call(page.querySelectorAll('.use-case-card'));
  if(!cards.length){return;}
  var activeRadio=document.getElementById('r-l-use-cases');
  var reduceMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  page.classList.add('is-reveal-ready');

  if(reduceMotion){
    cards.forEach(function(card){card.classList.add('is-visible');});
    return;
  }

  function revealVisibleCards(){
    if(activeRadio && !activeRadio.checked){return;}
    var threshold=window.innerHeight-90;
    cards.forEach(function(card){
      if(card.classList.contains('is-visible')){return;}
      var rect=card.getBoundingClientRect();
      if(rect.top<threshold && rect.bottom>0){
        card.classList.add('is-visible');
      }
    });
  }

  var ticking=false;
  function requestReveal(){
    if(ticking){return;}
    ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      revealVisibleCards();
    });
  }

  window.addEventListener('scroll',requestReveal,{passive:true});
  window.addEventListener('resize',requestReveal);
  if(activeRadio){activeRadio.addEventListener('change',requestReveal);}
  document.querySelectorAll('[data-go="l-use-cases"]').forEach(function(link){
    link.addEventListener('click',function(){setTimeout(requestReveal,0);});
  });
  requestReveal();
})();

/* Company sections use the same one-time viewport reveal as Use Cases. */
(function(){
  var page=document.getElementById('pg-l-company');
  if(!page){return;}
  var blocks=[].slice.call(page.querySelectorAll('.rv')).filter(function(block){
    return block.getClientRects().length>0;
  });
  if(!blocks.length){return;}
  var motionQuery=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if(motionQuery && motionQuery.matches){return;}

  function revealVisibleBlocks(){
    var threshold=window.innerHeight-90;
    blocks.forEach(function(block){
      if(block.classList.contains('is-visible')){return;}
      var rect=block.getBoundingClientRect();
      if(rect.top<threshold && rect.bottom>0){block.classList.add('is-visible');}
    });
  }

  var ticking=false;
  function requestReveal(){
    if(ticking){return;}
    ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      revealVisibleBlocks();
    });
  }

  window.addEventListener('scroll',requestReveal,{passive:true});
  window.addEventListener('resize',requestReveal);
  window.addEventListener('pageshow',requestReveal);
  page.addEventListener('focusin',function(event){
    blocks.forEach(function(block){
      if(block.contains(event.target)){block.classList.add('is-visible');}
    });
  });
  if(motionQuery && motionQuery.addEventListener){
    motionQuery.addEventListener('change',function(event){
      if(event.matches){
        blocks.forEach(function(block){block.classList.add('is-visible');});
        page.classList.remove('is-reveal-ready');
      }
    });
  }
  page.classList.add('is-reveal-ready');
  requestReveal();
})();

/* Render each published Use Case inside the shared on-site detail page. */
(function(){
  var detailPage=document.getElementById('pg-l-use-case-detail');
  if(!detailPage){return;}

  var heroCopy=detailPage.querySelector('.case-detail-hero-copy');
  var article=detailPage.querySelector('.case-detail-article');
  var image=detailPage.querySelector('.case-detail-hero-media img');
  if(!heroCopy || !article || !image){return;}

  var original={
    hero:heroCopy.innerHTML,
    article:article.innerHTML,
    imageSrc:image.getAttribute('src'),
    imageAlt:image.getAttribute('alt')
  };

  function renderCase(caseId){
    var template=document.getElementById('case-detail-template-'+caseId);
    if(!template){
      heroCopy.innerHTML=original.hero;
      article.innerHTML=original.article;
      image.setAttribute('src',original.imageSrc);
      image.setAttribute('alt',original.imageAlt);
      return;
    }

    var templateHero=template.content.querySelector('[data-case-template-hero]');
    var templateArticle=template.content.querySelector('[data-case-template-article]');
    if(templateHero){heroCopy.innerHTML=templateHero.innerHTML;}
    if(templateArticle){article.innerHTML=templateArticle.innerHTML;}
    image.setAttribute('src',template.dataset.imageSrc || original.imageSrc);
    image.setAttribute('alt',template.dataset.imageAlt || original.imageAlt);
  }

  var requestedCase=new URLSearchParams(window.location.search).get('case');
  if(requestedCase){renderCase(requestedCase);}
})();
