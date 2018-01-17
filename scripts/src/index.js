
import $ from 'jquery';
import _ from 'lodash';

import 'bootstrap-material-design';
import './../../styles/scss/app.scss';

import map from './map.js';

$('#show-map').click(e => {
	$(e.delegateTarget).closest('.overlay').fadeOut();
});

// Scroll į tagus
$('a[href^="#"]').click(e => {
	if (e.currentTarget.dataset.toggle) return;

	let target = $(e.currentTarget.hash);
	if (target.length){
		e.preventDefault();
		$('html').animate({
			scrollTop: target.offset().top - $('nav').height()
		}, {			
			duration: 800
		})
	}
});

$('*').bootstrapMaterialDesign();

window.$ = $;