import $ from 'jquery';
import _ from 'lodash'; 

import 'bootstrap-material-design';
import './../../styles/scss/app.scss';

import map from './map.js';

$('#show-map').click(e => {
	$(e.delegateTarget).closest('.overlay').fadeOut();
});

// Scroll, jeigu <a> href rodo į tag'ą HTML'e
$('a[href^="#"]').click(e => {
	if (e.currentTarget.dataset.toggle) return;

	let el     = $(e.currentTarget),
		target = $(e.currentTarget.hash),
		page   = $('html, body'),
		skippers = 'scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove';

	if (target.length){
		e.preventDefault();

		el.closest('li').addClass('active').siblings().removeClass('active');

		page
			.off(skippers)
			.on (skippers, function () {
				page.stop();
			})
			.clearQueue()
			.animate({
				scrollTop: target.offset().top - $('nav').height()
			}, {
				duration: 800
			}, () => {
				page.off(skippers);
			})
	}
});

$('*').bootstrapMaterialDesign();

window.$ = $;