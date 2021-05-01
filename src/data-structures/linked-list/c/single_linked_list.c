#include <stdio.h>
#include <stdlib.h>

struct Node {
  int data;
  struct Node* next;
};

struct Node* create_linked_list(int value);
void append_into_list(struct Node* list, int value);
void view_items_inside_list(struct Node* list);
void delete_node(struct Node* list, int value);

int main(void) {
  struct Node* list = create_linked_list(1);
  append_into_list(list, 2);
  append_into_list(list, 3);

  view_items_inside_list(list);

  return 0;
}

struct Node* create_linked_list(int value) {
  struct Node* head = (struct Node*) malloc(sizeof(struct Node));
  head->data = value;
  head->next = NULL;

  return head;
}

void append_into_list(struct Node* list, int value) {
  struct Node* new_node = (struct Node*) malloc(sizeof(struct Node));
  struct Node* last_node = list;

  new_node->data = value;
  new_node->next = NULL;

  while (last_node->next != NULL)
    last_node = last_node->next;

  last_node->next = new_node;
  return;
}

void view_items_inside_list(struct Node* list) {
  struct Node* tmp_list;
  tmp_list = list;

  while (tmp_list != NULL) {
    printf("The list value is: %d\n", tmp_list->data);
    tmp_list = tmp_list->next;
  };
}

void delete_node(struct Node* list, int value) {
  struct Node* tmp_list = list, *prev_list;

  if (tmp_list != NULL && tmp_list->data == value) {
    list = tmp_list->next;
    free(tmp_list);
    return;
  }

  while (tmp_list != NULL && tmp_list->data != value) {
    prev_list = tmp_list;
    tmp_list = tmp_list->next;
  }

  if (tmp_list == NULL) return;

  prev_list->next = tmp_list->next;

  free(tmp_list);
}
