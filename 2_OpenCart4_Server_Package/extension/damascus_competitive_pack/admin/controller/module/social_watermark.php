<?php
namespace Opencart\Admin\Controller\Extension\DamascusCompetitivePack\Module;
/**
 * Class SocialWatermark
 *
 * Product share bar + affiliate link generator + protected-preview watermark
 * for product pages. Installed as a module instance so it can be assigned to
 * any layout in Design > Layouts.
 *
 * @package Opencart\Admin\Controller\Extension\DamascusCompetitivePack\Module
 */
class SocialWatermark extends \Opencart\System\Engine\Controller {
	/**
	 * Default settings, shared by the form, the save fallback and the install
	 * routine so all three stay identical.
	 *
	 * @return array
	 */
	private function defaults(): array {
		return [
			'name'             => 'Product Share & Watermark',
			'title'            => 'شارك المنتج | Share this product',
			'text'             => 'اختر شبكة وشارك المنتج مع أصدقائك - Choose a network and share this product.',
			'affiliate_code'   => '',
			'show_watermark'   => '1',
			'show_affiliate'   => '1',
			'network_whatsapp' => '1',
			'network_telegram' => '1',
			'network_facebook' => '1',
			'network_x'        => '1',
			'network_linkedin' => '1',
			'network_email'    => '1',
			'status'           => '1'
		];
	}

	/**
	 * @return void
	 */
	public function index(): void {
		// load->language() returns the whole language array, which is exactly
		// what the Twig template needs (heading_title, entry_*, text_*, ...).
		$data = $this->load->language('extension/damascus_competitive_pack/module/social_watermark');

		$this->document->setTitle($this->language->get('heading_title'));

		$data['breadcrumbs'] = [];

		$data['breadcrumbs'][] = [
			'text' => $this->language->get('text_home'),
			'href' => $this->url->link('common/dashboard', 'user_token=' . $this->session->data['user_token'])
		];

		$data['breadcrumbs'][] = [
			'text' => $this->language->get('text_extension'),
			'href' => $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=module')
		];

		if (!isset($this->request->get['module_id'])) {
			$data['breadcrumbs'][] = [
				'text' => $this->language->get('heading_title'),
				'href' => $this->url->link('extension/damascus_competitive_pack/module/social_watermark', 'user_token=' . $this->session->data['user_token'])
			];

			$data['save'] = $this->url->link('extension/damascus_competitive_pack/module/social_watermark.save', 'user_token=' . $this->session->data['user_token']);
		} else {
			$data['breadcrumbs'][] = [
				'text' => $this->language->get('heading_title'),
				'href' => $this->url->link('extension/damascus_competitive_pack/module/social_watermark', 'user_token=' . $this->session->data['user_token'] . '&module_id=' . (int)$this->request->get['module_id'])
			];

			$data['save'] = $this->url->link('extension/damascus_competitive_pack/module/social_watermark.save', 'user_token=' . $this->session->data['user_token'] . '&module_id=' . (int)$this->request->get['module_id']);
		}

		$data['back'] = $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=module');

		$module_info = [];

		if (isset($this->request->get['module_id']) && ($this->request->server['REQUEST_METHOD'] != 'POST')) {
			$this->load->model('setting/module');

			$module_info = $this->model_setting_module->getModule((int)$this->request->get['module_id']);
		}

		$defaults = $this->defaults();

		foreach ($defaults as $key => $value) {
			if (isset($module_info[$key]) && $module_info[$key] !== '') {
				$data[$key] = $module_info[$key];
			} else {
				$data[$key] = $value;
			}
		}

		// A stored "0" must render as unchecked; only a saved module can
		// legitimately hold "0", a new one shows the defaults.
		if ($module_info) {
			foreach (['show_watermark', 'show_affiliate', 'network_whatsapp', 'network_telegram', 'network_facebook', 'network_x', 'network_linkedin', 'network_email', 'status'] as $flag) {
				$data[$flag] = !empty($module_info[$flag]) ? '1' : '0';
			}
		}

		$data['module_id'] = isset($this->request->get['module_id']) ? (int)$this->request->get['module_id'] : 0;

		$data['header'] = $this->load->controller('common/header');
		$data['column_left'] = $this->load->controller('common/column_left');
		$data['footer'] = $this->load->controller('common/footer');

		$this->response->setOutput($this->load->view('extension/damascus_competitive_pack/module/social_watermark', $data));
	}

	/**
	 * @return void
	 */
	public function save(): void {
		$this->load->language('extension/damascus_competitive_pack/module/social_watermark');

		$json = [];

		if (!$this->user->hasPermission('modify', 'extension/damascus_competitive_pack/module/social_watermark')) {
			$json['error']['warning'] = $this->language->get('error_permission');
		}

		$name = isset($this->request->post['name']) ? (string)$this->request->post['name'] : '';

		if ((oc_strlen($name) < 3) || (oc_strlen($name) > 64)) {
			$json['error']['name'] = $this->language->get('error_name');
		}

		if (!$json) {
			// Only keep keys this module understands, so a tampered POST cannot
			// inject arbitrary settings into the module JSON.
			$allowed = [
				'name', 'title', 'text', 'affiliate_code', 'show_watermark', 'show_affiliate',
				'network_whatsapp', 'network_telegram', 'network_facebook', 'network_x',
				'network_linkedin', 'network_email', 'status'
			];

			$defaults = $this->defaults();
			$setting = [];

			foreach ($allowed as $key) {
				$value = isset($this->request->post[$key]) ? (string)$this->request->post[$key] : '';

				// Never let an empty heading or intro blank out the storefront;
				// fall back to the shipped bilingual defaults instead.
				if (($value === '') && in_array($key, ['title', 'text'], true)) {
					$value = $defaults[$key];
				}

				$setting[$key] = $value;
			}

			$this->load->model('setting/module');

			$module_id = isset($this->request->post['module_id']) ? (int)$this->request->post['module_id'] : 0;

			if (!$module_id) {
				$module_id = $this->model_setting_module->addModule('damascus_competitive_pack.social_watermark', $setting);

				$this->assignToProductLayout($module_id);
			} else {
				$this->model_setting_module->editModule($module_id, $setting);
			}

			$json['success'] = $this->language->get('text_success');
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}

	/**
	 * Called by the Extensions list install button. Creates one ready-to-use
	 * module instance and assigns it to the Product layout, so the feature is
	 * live immediately without a manual Design > Layouts edit.
	 *
	 * @return void
	 */
	public function install(): void {
		$setting = $this->defaults();

		// Reuse an existing affiliate tracking code so the generated affiliate
		// link credits a real account on the first order. The code is editable
		// afterwards in Marketing > Affiliates and in this module.
		$query = $this->db->query("SELECT `tracking` FROM `" . DB_PREFIX . "customer_affiliate` WHERE `status` = '1' AND `tracking` != '' ORDER BY `customer_id` LIMIT 1");

		if ($query->num_rows) {
			$setting['affiliate_code'] = (string)$query->row['tracking'];
		}

		$this->load->model('setting/module');

		$module_id = $this->model_setting_module->addModule('damascus_competitive_pack.social_watermark', $setting);

		$this->assignToProductLayout($module_id);
	}

	/**
	 * Adds the module to the Product layout (once). Kept private to the
	 * extension so the install button cannot create duplicate layout rows.
	 *
	 * @param int $module_id
	 *
	 * @return void
	 */
	private function assignToProductLayout(int $module_id): void {
		if (!$module_id) {
			return;
		}

		$code = 'damascus_competitive_pack.social_watermark.' . $module_id;

		$existing = $this->db->query("SELECT `layout_module_id` FROM `" . DB_PREFIX . "layout_module` WHERE `code` = '" . $this->db->escape($code) . "'");

		if ($existing->num_rows) {
			return;
		}

		$query = $this->db->query("SELECT `layout_id` FROM `" . DB_PREFIX . "layout_route` WHERE `route` = 'product/product' AND `store_id` = '0'");

		if (!$query->num_rows) {
			return;
		}

		$this->db->query("INSERT INTO `" . DB_PREFIX . "layout_module` SET `layout_id` = '" . (int)$query->row['layout_id'] . "', `code` = '" . $this->db->escape($code) . "', `position` = 'content_bottom', `sort_order` = '1'");
	}
}
