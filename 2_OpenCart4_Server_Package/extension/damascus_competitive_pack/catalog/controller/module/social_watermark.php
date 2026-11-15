<?php
namespace Opencart\Catalog\Controller\Extension\DamascusCompetitivePack\Module;
/**
 * Class SocialWatermark
 *
 * Renders the product share bar, the affiliate tracking link and the
 * protected-preview watermark for the current product page.
 *
 * @package Opencart\Catalog\Controller\Extension\DamascusCompetitivePack\Module
 */
class SocialWatermark extends \Opencart\System\Engine\Controller {
	/**
	 * @param array $setting module instance settings
	 *
	 * @return string
	 */
	public function index(array $setting): string {
		$this->load->language('extension/damascus_competitive_pack/module/social_watermark');

		if (empty($setting['status'])) {
			return '';
		}

		$product_id = isset($this->request->get['product_id']) ? (int)$this->request->get['product_id'] : 0;

		if (!$product_id) {
			return '';
		}

		$this->load->model('catalog/product');
		$this->load->model('tool/image');

		$product_info = $this->model_catalog_product->getProduct($product_id);

		if (!$product_info) {
			return '';
		}

		$this->document->addStyle('extension/damascus_competitive_pack/catalog/view/stylesheet/damascus_rtl.css');

		$language = (string)$this->config->get('config_language');

		$product_url = $this->url->link('product/product', 'product_id=' . $product_id . '&language=' . $language);

		$share_text = html_entity_decode($product_info['name'], ENT_QUOTES, 'UTF-8') . ' - ' . html_entity_decode((string)$this->config->get('config_name'), ENT_QUOTES, 'UTF-8');

		$data['heading'] = (string)($setting['title'] ?? $this->language->get('heading_title'));
		$data['intro'] = (string)($setting['text'] ?? '');
		$data['product_name'] = html_entity_decode($product_info['name'], ENT_QUOTES, 'UTF-8');
		$data['share_url'] = $product_url;

		// Affiliate / campaign link. The storefront marketing startup reads
		// ?tracking=CODE, remembers it in the session and credits the campaign
		// or affiliate account on the next order.
		$affiliate_code = trim((string)($setting['affiliate_code'] ?? ''));

		$data['affiliate_url'] = '';

		if (($affiliate_code !== '') && !empty($setting['show_affiliate'])) {
			$data['affiliate_url'] = $this->url->link('product/product', 'product_id=' . $product_id . '&language=' . $language . '&tracking=' . rawurlencode($affiliate_code));
		}

		$data['text_affiliate'] = $this->language->get('text_affiliate');
		$data['text_copy'] = $this->language->get('text_copy');
		$data['text_copied'] = $this->language->get('text_copied');

		$networks = [];

		if (!empty($setting['network_whatsapp'])) {
			$networks[] = [
				'name'  => 'WhatsApp',
				'class' => 'success',
				'href'  => 'https://api.whatsapp.com/send?text=' . rawurlencode($share_text . ' ' . $product_url)
			];
		}

		if (!empty($setting['network_telegram'])) {
			$networks[] = [
				'name'  => 'Telegram',
				'class' => 'info',
				'href'  => 'https://t.me/share/url?url=' . rawurlencode($product_url) . '&text=' . rawurlencode($share_text)
			];
		}

		if (!empty($setting['network_facebook'])) {
			$networks[] = [
				'name'  => 'Facebook',
				'class' => 'primary',
				'href'  => 'https://www.facebook.com/sharer/sharer.php?u=' . rawurlencode($product_url)
			];
		}

		if (!empty($setting['network_x'])) {
			$networks[] = [
				'name'  => 'X',
				'class' => 'dark',
				'href'  => 'https://twitter.com/intent/tweet?url=' . rawurlencode($product_url) . '&text=' . rawurlencode($share_text)
			];
		}

		if (!empty($setting['network_linkedin'])) {
			$networks[] = [
				'name'  => 'LinkedIn',
				'class' => 'secondary',
				'href'  => 'https://www.linkedin.com/sharing/share-offsite/?url=' . rawurlencode($product_url)
			];
		}

		if (!empty($setting['network_email'])) {
			$networks[] = [
				'name'  => 'E-mail',
				'class' => 'light',
				'href'  => 'mailto:?subject=' . rawurlencode($share_text) . '&body=' . rawurlencode($share_text . ' ' . $product_url)
			];
		}

		$data['networks'] = $networks;

		$data['show_watermark'] = !empty($setting['show_watermark']);
		$data['watermark_text'] = $this->language->get('text_preview');

		$data['thumb'] = '';

		if ($product_info['image'] && is_file(DIR_IMAGE . html_entity_decode($product_info['image'], ENT_QUOTES, 'UTF-8'))) {
			$data['thumb'] = $this->model_tool_image->resize(html_entity_decode($product_info['image'], ENT_QUOTES, 'UTF-8'), 320, 200);
		}

		return $this->load->view('extension/damascus_competitive_pack/module/social_watermark', $data);
	}
}
